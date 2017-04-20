from datetime import datetime

from sqlalchemy import desc
from sqlalchemy.orm.exc import NoResultFound
import graphene
from graphene.relay import Node
from graphene_sqlalchemy import SQLAlchemyObjectType
from graphene_sqlalchemy import SQLAlchemyConnectionField
from graphene_sqlalchemy.converter import (
    convert_column_to_string, convert_sqlalchemy_type)
from graphene_sqlalchemy.utils import get_query
from pyramid.httpexceptions import HTTPUnauthorized
from pyramid.security import Everyone

from assembl.auth import IF_OWNED, CrudPermissions
from assembl.auth.util import get_permissions
from assembl.lib.sqla_types import EmailString
from assembl import models
from .types import SQLAlchemyInterface, SQLAlchemyUnion

convert_sqlalchemy_type.register(EmailString)(convert_column_to_string)
models.Base.query = models.Base.default_db.query_property()


class SecureObjectType(object):

    @classmethod
    def get_node(cls, id, context, info):
        try:
            result = cls.get_query(context).get(id)
        except NoResultFound:
            return None

        discussion_id = context.matchdict['discussion_id']
        user_id = context.authenticated_userid or Everyone
        permissions = get_permissions(user_id, discussion_id)
        if not result.user_can(user_id, CrudPermissions.READ, permissions):
            raise HTTPUnauthorized()

        return result

# For security, always use only_fields in the Meta class to be sure we don't
# expose every fields and relations. You need at least only_fields = ('id', )
# to take effect.
# Auto exposing everything will automatically convert relations
# like AgentProfile.posts_created and create dynamically the
# object types Post, PostConnection which will conflict with those added
# manually.


def get_entries(langstring):
    # langstring.entries is a backref, it doesn't get updated until the commit.
    # Even with db.flush(), new entries doesn't show up or a specific entry show up
    # several times... so we do the query instead of using langstring.entries
    results = models.LangStringEntry.query.join(
            models.LangStringEntry.langstring
        ).filter(models.LangStringEntry.tombstone_date == None
        ).filter(models.LangString.id == langstring.id).all()
    return results


def resolve_langstring(langstring, locale_code):
    """If locale_code is None, return the best lang based on user prefs,
    otherwise respect the locale_code and return the right translation or None.
    """
    if langstring is None:
        return None

    if locale_code is None:
        return langstring.best_entry_in_request().value

    return {e.locale_code: e.value
            for e in get_entries(langstring)}.get(locale_code, None)


def resolve_langstring_entries(obj, attr):
    langstring = getattr(obj, attr, None)
    if langstring is None:
        return []

    entries = []
    for entry in get_entries(langstring):
        entries.append(
            LangStringEntry(
                locale_code=entry.locale_code,
                value=entry.value
            )
        )

    return entries


def langstring_from_input_entries(entries):
    """Return a LangString SA object based on GraphQL LangStringEntryInput entries.
    """
    if entries is not None and len(entries) > 0:
        langstring = models.LangString.create(
            entries[0]['value'],
            entries[0]['locale_code'])
        for entry in entries[1:]:
            locale_id = models.Locale.get_id_of(entry['locale_code'])
            langstring.add_entry(
                models.LangStringEntry(
                    langstring=langstring,
                    value=entry['value'],
                    locale_id=locale_id
                )
            )

        return langstring

    return None


def update_langstring_from_input_entries(obj, attr, entries):
    """Update langstring from getattr(obj, attr) based on GraphQL LangStringEntryInput entries.
    """
    langstring = getattr(obj, attr, None)
    if langstring is None:
        new_langstring = langstring_from_input_entries(entries)
        if new_langstring is not None:
            setattr(obj, attr, new_langstring)
        return

    current_title_entries_by_locale_code = {
        e.locale_code: e for e in get_entries(langstring)}
    if entries is not None:
        for entry in entries:
            locale_code = entry['locale_code']
            current_entry = current_title_entries_by_locale_code.get(locale_code, None)
            if current_entry is not None:
                if current_entry.value != entry['value']:
                    if not entry['value']:
                        current_entry.tombstone_date = datetime.utcnow()
                    else:
                        current_entry.change_value(entry['value'])
            else:
                locale_id = models.Locale.get_id_of(locale_code)
                langstring.add_entry(
                    models.LangStringEntry(
                        langstring=langstring,
                        value=entry['value'],
                        locale_id=locale_id
                    )
                )
    # need to flush or get_entries(langstring) will not give the new entries
    langstring.db.flush()


class LangStringEntryFields(graphene.AbstractType):
    value = graphene.String(required=True)
    locale_code = graphene.String(required=True)


class LangStringEntry(graphene.ObjectType, LangStringEntryFields):
    pass


class LangStringEntryInput(graphene.InputObjectType, LangStringEntryFields):
    pass


class AgentProfile(SecureObjectType, SQLAlchemyObjectType):
    class Meta:
        model = models.AgentProfile
        interfaces = (Node, )
        only_fields = ('id', 'name')


# class User(AgentProfile):
#     class Meta:
#         model = models.User
#         interfaces = (Node, )
#         only_fields = ('id', 'name')  # preferredEmail


class SentimentCounts(graphene.ObjectType):
    dont_understand = graphene.Int()
    disagree = graphene.Int()
    like = graphene.Int()
    more_info = graphene.Int()


class PostInterface(SQLAlchemyInterface):
    class Meta:
        model = models.Post
        only_fields = ('creation_date', 'creator')
        # Don't add id in only_fields in an interface or the the id of Post
        # will be just the primary key, not the base64 type:id

    subject = graphene.String(lang=graphene.String())
    body = graphene.String(lang=graphene.String())
    sentiment_counts = graphene.Field(SentimentCounts)
    # TODO my_sentiment

    def resolve_subject(self, args, context, info):
        subject = resolve_langstring(self.get_subject(), args.get('lang'))
        return subject

    def resolve_body(self, args, context, info):
        body = resolve_langstring(self.get_body(), args.get('lang'))
        return body

    def resolve_sentiment_counts(self, args, context, info):
        sentiment_counts = self.sentiment_counts
        return SentimentCounts(
            dont_understand=sentiment_counts['dont_understand'],
            disagree=sentiment_counts['disagree'],
            like=sentiment_counts['like'],
            more_info=sentiment_counts['more_info'],
        )


class Post(SecureObjectType, SQLAlchemyObjectType):
    class Meta:
        model = models.Post
        interfaces = (Node, PostInterface)
        only_fields = ('id', )  # inherits fields from Post interface only


class PropositionPost(Post):
    class Meta:
        model = models.PropositionPost
        interfaces = (Node, PostInterface)
        only_fields = ('id', )  # inherits fields from Post interface only


class PostUnion(SQLAlchemyUnion):
    class Meta:
        types = (PropositionPost, Post)
        model = models.Post

    @classmethod
    def resolve_type(cls, instance, context, info):
        if isinstance(instance, graphene.ObjectType):
            return type(instance)
        elif isinstance(instance, models.PropositionPost): # must be above Post
            return PropositionPost
        elif isinstance(instance, models.Post):
            return Post


class PostConnection(graphene.Connection):
    class Meta:
        node = PostUnion


class Video(graphene.ObjectType):
    title = graphene.String()
    description = graphene.String()
    html_code = graphene.String()


class Idea(SecureObjectType, SQLAlchemyObjectType):
    class Meta:
        model = models.Idea
        interfaces = (Node, )
        only_fields = ('id', 'short_title', )

    posts = SQLAlchemyConnectionField(PostConnection)

    def resolve_posts(self, args, context, info):
        connection_type = info.return_type.graphene_type  # this is PostConnection
        model = connection_type._meta.node._meta.model  # this is models.PostUnion
        query = self.get_related_posts_query(
            ).filter(model.publication_state == models.PublicationStates.PUBLISHED
            ).order_by(desc(model.creation_date), model.id)
        # pagination is done after that, no need to do it ourself
        return query


class Question(SecureObjectType, SQLAlchemyObjectType):
    class Meta:
        model = models.Question
        interfaces = (Node, )
        only_fields = ('id', )

    title = graphene.String(lang=graphene.String())
    title_entries = graphene.List(LangStringEntry)
    posts = SQLAlchemyConnectionField(PostConnection, random=graphene.Boolean())

    def resolve_title(self, args, context, info):
        title = resolve_langstring(self.title, args.get('lang'))
        return title

    def resolve_title_entries(self, args, context, info):
        return resolve_langstring_entries(self, 'title')

    def resolve_posts(self, args, context, info):
        random = args.get('random', False)
        # TODO
        # If random is True returns 10 posts, the first one is the latest post created by the user,
        # then the remaining ones are in random order.
        # If random is False, return all the posts in creation_date desc order.
        if random:
            return []
        else:
            connection_type = info.return_type.graphene_type  # this is PostConnection
            model = connection_type._meta.node._meta.model  # this is models.PostUnion
            query = self.get_related_posts_query(
                ).filter(model.publication_state == models.PublicationStates.PUBLISHED
                ).order_by(desc(model.creation_date), model.id)

        # pagination is done after that, no need to do it ourself
        return query


class Thematic(SecureObjectType, SQLAlchemyObjectType):
    class Meta:
        model = models.Thematic
        interfaces = (Node, )
        only_fields = ('id', 'identifier')

    title = graphene.String(lang=graphene.String())
    title_entries = graphene.List(LangStringEntry)
    description = graphene.String(lang=graphene.String())
    description_entries = graphene.List(LangStringEntry)
    questions = graphene.List(Question)
    video = graphene.Field(Video, lang=graphene.String())
    img_url = graphene.String()
    num_posts = graphene.Int()
    num_contributors = graphene.Int()

    def resolve_title(self, args, context, info):
        title = resolve_langstring(self.title, args.get('lang'))
        return title

    def resolve_title_entries(self, args, context, info):
        return resolve_langstring_entries(self, 'title')

    def resolve_description(self, args, context, info):
        return resolve_langstring(self.description, args.get('lang'))

    def resolve_description_entries(self, args, context, info):
        return resolve_langstring_entries(self, 'description')

    def resolve_questions(self, args, context, info):
        return self.get_children()

    def resolve_video(self, args, context, info):
        title = resolve_langstring(self.video_title, args.get('lang'))
        description = resolve_langstring(self.video_description, args.get('lang'))
        return Video(
            title=title,
            description=description,
            html_code=self.video_html_code,
        )

    def resolve_img_url(self, args, context, info):
        # TODO imgUrl
        return ""


class Query(graphene.ObjectType):
    node = Node.Field()
    posts = SQLAlchemyConnectionField(PostConnection, idea_id=graphene.ID())
    ideas = SQLAlchemyConnectionField(Idea)
    thematics = graphene.List(Thematic, identifier=graphene.String())
    # agent_profiles = SQLAlchemyConnectionField(AgentProfile)

    def resolve_ideas(self, args, context, info):
        connection_type = info.return_type.graphene_type  # this is IdeaConnection
        model = connection_type._meta.node._meta.model  # this is models.Idea
        query = get_query(model, context)
        discussion_id = context.matchdict['discussion_id']
        discussion = models.Discussion.get(discussion_id)
        root_idea_id = discussion.root_idea.id
        descendants_query = model.get_descendants_query(
            root_idea_id, inclusive=False)
        query = query.filter(model.id.in_(descendants_query)
            ).filter(model.hidden == False).order_by(model.id)
        # pagination is done after that, no need to do it ourself
        return query

    def resolve_posts(self, args, context, info):
        connection_type = info.return_type.graphene_type  # this is PostConnection
        model = connection_type._meta.node._meta.model  # this is models.PostUnion
        discussion_id = context.matchdict['discussion_id']
        idea_id = args.get('idea_id', None)
        if idea_id is not None:
            id_ = int(Node.from_global_id(idea_id)[1])
            idea = models.Idea.get(id_)
            if idea.discussion_id != discussion_id:
                return None
        else:
            discussion = models.Discussion.get(discussion_id)
            idea = discussion.root_idea

        query = idea.get_related_posts_query(
            ).filter(model.publication_state == models.PublicationStates.PUBLISHED
            ).order_by(desc(model.creation_date), model.id)

        # pagination is done after that, no need to do it ourself
        return query

    def resolve_thematics(self, args, context, info):
        identifier = args.get('identifier', None)
        model = Thematic._meta.model
        discussion_id = context.matchdict['discussion_id']
        query = get_query(model, context
            ).filter(model.discussion_id == discussion_id)
        if identifier is not None:
            query = query.filter(model.identifier == identifier)

        return query


class VideoInput(graphene.InputObjectType):
    title_entries = graphene.List(LangStringEntryInput)
    description_entries = graphene.List(LangStringEntryInput)
    html_code = graphene.String()


class QuestionInput(graphene.InputObjectType):
    id = graphene.ID()
    title_entries = graphene.List(LangStringEntryInput, required=True)


class CreateThematic(graphene.Mutation):
    class Input:
        # Careful, having required=True on a graphene.List only means
        # it can't be None, having an empty [] is perfectly valid.
        title_entries = graphene.List(LangStringEntryInput, required=True)
        description_entries = graphene.List(LangStringEntryInput)
        identifier = graphene.String(required=True)
        video = graphene.Argument(VideoInput)
        questions = graphene.List(QuestionInput)
        # TODO upload img example http://docs.pylonsproject.org/projects/pyramid-cookbook/en/latest/forms/file_uploads.html

    thematic = graphene.Field(lambda: Thematic)

    @staticmethod
    def mutate(root, args, context, info):
        cls = models.Thematic
        discussion_id = context.matchdict['discussion_id']
        discussion = models.Discussion.get(discussion_id)
        user_id = context.authenticated_userid or Everyone

        permissions = get_permissions(user_id, discussion_id)
        allowed = cls.user_can_cls(user_id, CrudPermissions.CREATE, permissions)
        if not allowed or (allowed == IF_OWNED and user_id == Everyone):
            raise HTTPUnauthorized()

        identifier = args.get('identifier')
        with cls.default_db.no_autoflush:
            title_entries = args.get('title_entries')
            if len(title_entries) == 0:
                raise Exception('Thematic titleEntries needs at least one entry')
                # Better to have this message than
                # 'NoneType' object has no attribute 'owner_object'
                # when creating the saobj below if title=None

            title_langstring = langstring_from_input_entries(title_entries)
            description_langstring = langstring_from_input_entries(args.get('description_entries'))
            kwargs = {}
            if description_langstring is not None:
                kwargs['description'] = description_langstring

            video = args.get('video')
            if video is not None:
                video_title = langstring_from_input_entries(video['title_entries'])
                if video_title is not None:
                    kwargs['video_title'] = video_title

                video_description = langstring_from_input_entries(video['description_entries'])
                if video_description is not None:
                    kwargs['video_description'] = video_description

                kwargs['video_html_code'] = video['html_code']

            # Our thematic, because it inherits from Idea, needs to be
            # associated to the root idea of the discussion.
            # We create a hidden root thematic, corresponding to the
            # `identifier` phase, child of the root idea,
            # and add our thematic as a child of this root thematic.
            root_thematic = [idea
                             for idea in discussion.root_idea.get_children()
                             if getattr(idea, 'identifier', '') == identifier]
            if not root_thematic:
                short_title = u'Phase {}'.format(identifier)
                root_thematic = cls(
                    discussion_id=discussion_id,
                    short_title=short_title,
                    title=langstring_from_input_entries(
                        [{'locale_code': 'en', 'value': short_title}]),
                    identifier=identifier,
                    hidden=True)
                discussion.root_idea.children.append(root_thematic)
            else:
                root_thematic = root_thematic[0]

            # take the first entry and set it for short_title
            short_title = title_entries[0]['value']
            saobj = cls(
                discussion_id=discussion_id,
                title=title_langstring,
                short_title=short_title,
                identifier=identifier,
                **kwargs)
            root_thematic.children.append(saobj)
            db = saobj.db
            db.add(saobj)
            db.flush()

            questions_input = args.get('questions')
            if questions_input is not None:
                for question_input in questions_input:
                    title_ls = langstring_from_input_entries(
                        question_input['title_entries'])
                    saobj.children.append(
                        models.Question(
                            title=title_ls,
                            discussion_id=discussion_id
                        )
                    )
                db.flush()

        return CreateThematic(thematic=saobj)


class UpdateThematic(graphene.Mutation):
    class Input:
        id = graphene.ID(required=True)
        title_entries = graphene.List(LangStringEntryInput, required=True)
        description_entries = graphene.List(LangStringEntryInput)
        identifier = graphene.String(required=True)
        video = graphene.Argument(VideoInput)
        questions = graphene.List(QuestionInput)

    thematic = graphene.Field(lambda: Thematic)

    @staticmethod
    def mutate(root, args, context, info):
        cls = models.Thematic
        discussion_id = context.matchdict['discussion_id']
        user_id = context.authenticated_userid or Everyone

        thematic_id = args.get('id')
        id_ = int(Node.from_global_id(thematic_id)[1])
        thematic = cls.get(id_)

        permissions = get_permissions(user_id, discussion_id)
        allowed = thematic.user_can(user_id, CrudPermissions.UPDATE, permissions)
        if not allowed or (allowed == IF_OWNED and user_id == Everyone):
            raise HTTPUnauthorized()

        with cls.default_db.no_autoflush:
            title_entries = args.get('title_entries')
            if len(title_entries) == 0:
                raise Exception('Thematic titleEntries needs at least one entry')
                # Better to have this message than
                # 'NoneType' object has no attribute 'owner_object'
                # when creating the saobj below if title=None

            update_langstring_from_input_entries(thematic, 'title', title_entries)
            update_langstring_from_input_entries(thematic, 'description', args.get('description_entries'))
            kwargs = {}
            video = args.get('video')
            if video is not None:
                update_langstring_from_input_entries(thematic, 'video_title', video['title_entries'])
                update_langstring_from_input_entries(thematic, 'video_description', video['description_entries'])
                kwargs['video_html_code'] = video['html_code']

            # take the first entry and set it for short_title
            kwargs['short_title'] = title_entries[0]['value']
            kwargs['identifier'] = args.get('identifier')
            for attr, value in kwargs.items():
                setattr(thematic, attr, value)
            db = thematic.db
            db.flush()

            questions_input = args.get('questions')
            # TODO delete questions that are not in questions_input? or have an explicit DeleteQuestion mutation?
            # TODO raise exception if proposals associated to deleted question?
            if questions_input is not None:
                for question_input in questions_input:
                    if question_input.get('id', None) is not None:
                        id_ = int(Node.from_global_id(question_input['id'])[1])
                        question = models.Question.get(id_)
                        update_langstring_from_input_entries(
                            question, 'title', question_input['title_entries'])
                    else:
                        title_ls = langstring_from_input_entries(
                            question_input['title_entries'])
                        models.Question(
                            title=title_ls,
                            discussion_id=discussion_id
                        )
                        thematic.children.append(
                            models.Question(
                                title=title_ls,
                                discussion_id=discussion_id
                            )
                        )
                db.flush()

        return UpdateThematic(thematic=thematic)

# TODO DeleteThematic, raise exception if questions associated with it
# TODO CreatePost which publish the post
# TODO AddSentimentToPost
# TODO DeleteSentimentToPost
# TODO csv export


class Mutations(graphene.ObjectType):
    create_thematic = CreateThematic.Field()
    update_thematic = UpdateThematic.Field()


Schema = graphene.Schema(query=Query, mutation=Mutations)


'''
$ pshell local.ini
import json
from assembl.graphql.schema import Schema as schema
from webtest import TestRequest
request = TestRequest.blank('/', method="POST")
request.matchdict = {"discussion_id": 6}
# take the first sysadmin:
userid = models.User.default_db.query(models.User).join(models.User.roles).filter(models.Role.id == 7)[0:1][0].id
request.authenticated_userid = userid

# and after that, execute a query or mutation....
# For mutations, see examples in tests/test_graphql.py (replace graphql_request by request)
# In pshell, you need to db.commit() if you want a mutation to be persistent.

#print the schema as text:
print str(schema)

#schema.execute returns a ExecutionResult object with data and errors attributes on it.

#get node:
print json.dumps(schema.execute('query { node(id:"UG9zdDoyMzU5") { ... on Post { id, creator { name } } } }', context_value=request).data, indent=2)

# get posts for a specific idea:
print json.dumps(schema.execute('query { node(id:"SWRlYToyNDU0") { ... on Idea { id, posts { edges { node { ... on PostInterface { subject, body, creationDate, creator { name } } } } } } } }', context_value=request).data, indent=2)

#get ideas:
print json.dumps(schema.execute('query { ideas(first: 5) { pageInfo { endCursor hasNextPage } edges { node { id } } } }', context_value=request).data, indent=2)

#get posts:
print json.dumps(schema.execute('query { posts(first: 5) { pageInfo { endCursor hasNextPage } edges { node { ... on Post {id, creator { name }, subject, body, sentimentCounts {dontUnderstand disagree like moreInfo }} } } } }', context_value=request).data, indent=2)
# curl --silent -XPOST -H "Content-Type:application/json" -d '{ "query": "query { posts(first: 5) { pageInfo { endCursor hasNextPage } edges { node { ... on Post {id, creator { name }} } } } }" }' http://localhost:6543/sandbox/graphql
# to be authenticated add the assembl_session cookie (look the value in the Chrome console):
# -H 'Cookie:assembl_session=d8deabe718595c01d3899aa686ac027193cc7d6984bd73b14afc42738d798018629b6e8a;'

#get thematics with questions:
print json.dumps(schema.execute('query { thematics(identifier:"survey") { id, title, description, numPosts, numContributors, questions { title }, video {title, description, htmlCode} } }', context_value=request).data, indent=2)

'''
