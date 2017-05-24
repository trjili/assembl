import json
from pyramid.events import NewRequest
from pyramid.httpexceptions import HTTPUnauthorized, HTTPServiceUnavailable
from pyramid.security import authenticated_userid, Everyone
from pyramid.view import view_config

from assembl.auth import CrudPermissions
from assembl.auth.util import get_permissions
from assembl.indexing.utils import connect
from assembl.indexing.settings import get_index_settings
from assembl.indexing.changes import changes
from assembl.indexing import indexing_active
from assembl import models
from assembl.lib.sqla import get_session_maker
from assembl.lib import config


def get_curl_query(query):
    return "curl -XGET '{}:9200/_search?pretty' -d '{}'".format(
        config.get('elasticsearch_host', 'localhost'),
        json.dumps(query).replace("'", "\\u0027"))


@view_config(route_name='search', renderer='json')
def search_endpoint(context, request):
    if not indexing_active():
        return HTTPServiceUnavailable("Indexing inactive")

    query = request.json_body
    # u'query': {u'bool': {u'filter': [{u'term': {u'discussion_id': u'23'}}]}}
    filters = [fil for fil in query['query']['bool']['filter']]
    discussion_id = [f.values()[0].values()[0]
                     for f in filters if 'discussion_id' in f.values()[0].keys()][0]
    discussion = models.Discussion.get_instance(discussion_id)
    if discussion is None:
        raise HTTPUnauthorized()

    user_id = authenticated_userid(request) or Everyone
    permissions = get_permissions(user_id, discussion_id)
    if not discussion.user_can(user_id, CrudPermissions.READ, permissions):
        raise HTTPUnauthorized()

    es = connect()
    index_name = get_index_settings()['index_name']
#    print get_curl_query(query)
    result = es.search(index=index_name, body=query)

    # add creator_name in each hit
    creator_ids = set([hit['_source']['creator_id']
                       for hit in result['hits']['hits']
                       if hit['_source'].get('creator_id', None) is not None])
    session = get_session_maker()
    creators = session.query(models.AgentProfile.id, models.AgentProfile.name
        ).filter(models.AgentProfile.id.in_(creator_ids)).all()
    creators_by_id = dict(creators)
    for hit in result['hits']['hits']:
        source = hit['_source']
        creator_id = source.get('creator_id', None)
        # Remove inner_hits key to not leak posts from private discussion.
        # You can easily craft a query to get the participants of a public
        # discussion and do a has_child filter with inner_hits on a private discussion.
        if 'inner_hits' in hit:
            del hit['inner_hits']

        if creator_id is not None:
            source['creator_name'] = creators_by_id.get(creator_id)

        if hit['_type'] == 'idea':
            idea = models.Idea.get_instance(source['id'])
            # The check is not really necessary because it's the same
            # 'read' permission as the discussion, but it doesn't cost anything
            # to check it and the READ permission may change in the future.
            if not idea.user_can(user_id, CrudPermissions.READ, permissions):
                raise HTTPUnauthorized

            source['num_posts'] = idea.num_posts
            source['num_contributors'] = idea.num_contributors
        elif hit['_type'] == 'user':
            agent_profile = models.AgentProfile.get_instance(source['id'])
            if not agent_profile.user_can(user_id, CrudPermissions.READ, permissions):
                raise HTTPUnauthorized

            source['num_posts'] = agent_profile.count_posts_in_discussion(discussion_id)
        # Don't do an extra request to verify the CrudPermissions.READ permission
        # for post or synthesis.
        # It's currently the same 'read' permission as the discussion.
        # elif hit['_type'] in ('synthesis', 'post'):
        #     post = models.Post.get_instance(source['id'])
        #     if not post.user_can(user_id, CrudPermissions.READ, permissions):
        #         raise HTTPUnauthorized

    return result


def join_transaction(event):
    if indexing_active():
        changes._join()


def includeme(config):
    config.add_route('search', '/_search')
    # join ElasticChanges datamanager to the transaction at the beginning
    # of the request to avoid joining when the status is Committing
    # If I don't do that, the elasticsearch data manager may actually join
    # the transaction when the transaction is committing, and this fail with an error.
    # The after_insert sqlalchemy event that I use to index an object (and so the
    # elasticsearch data manager join the transaction) is triggered via the session.flush()
    # in the tcp_begin of sqlalchemy data manager. You can't add data managers to a
    # transaction which is in a Committing state.
    config.add_subscriber(join_transaction, NewRequest)
