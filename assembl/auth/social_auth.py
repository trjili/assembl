import re

from pyramid.events import subscriber, BeforeRender
from pyramid.security import (
    remember,
    Everyone,
    authenticated_userid)

from social.apps.pyramid_app.utils import backends
from social.strategies.pyramid_strategy import PyramidStrategy
from social.utils import to_setting_name

from assembl.models import User, Preferences
from .util import discussion_from_request, maybe_auto_subscribe


def login_user(backend, user, user_social_auth):
    remember(backend.strategy.request, user.id)


def login_required(request):
    logged_in = authenticated_userid(request)
    return logged_in is None


def get_user(request):
    user_id = request.session.get('user_id')
    if user_id:
        user = User.default_db.query(
            User).filter(User.id == user_id).first()
    else:
        user = None
    return user


@subscriber(BeforeRender)
def add_social(event):
    request = event['request']
    event['social'] = backends(request, request.user)


def user_details(
        strategy, details, user=None, social=None, response=None,
        *args, **kwargs):
    social.set_extra_data(response)


def associate_user(backend, uid, user=None, social=None, *args, **kwargs):
    from social.pipeline.social_auth import \
        associate_user as psa_associate_user
    from pyramid.threadlocal import get_current_request
    results = psa_associate_user(
        backend, uid, user, social, *args, **kwargs)
    if results and isinstance(results, dict):
        user = results['user']
    request = get_current_request()
    discussion = discussion_from_request(request)
    if discussion:
        maybe_auto_subscribe(user, discussion)
    return results


class AssemblStrategy(PyramidStrategy):

    def get_preferences(self):
        discussion = discussion_from_request(self.request)
        if discussion:
            return discussion.preferences
        else:
            return Preferences.get_default_preferences()

    def get_setting(self, name):
        """Return value for given setting name. May extract from discussion prefs"""
        # TODO: Add WHITELISTED_DOMAINS
        if name.split("_")[-1] in ('KEY', 'SECRET', 'SERVER'):
            prefs = self.get_preferences()
            backend = prefs["authorization_server_backend"]
            if backend:
                m = re.match((
                    r"^(?:SOCIAL_AUTH_)?(?:%s_)?(KEY|SECRET|SERVER)$"
                    % to_setting_name(backend)), name)
                if m:
                    val = prefs["authorization_" + m.group(1).lower()]
                    if val:
                        return val
        return super(AssemblStrategy, self).get_setting(name)

    # def partial_from_session(self, session):
    #     from social.pipeline.utils import partial_from_session
    #     return partial_from_session(self, session)

    def get_pipeline(self):
        return (
            # Get the information we can about the user and return it in a simple
            # format to create the user instance later. On some cases the details are
            # already part of the auth response from the provider, but sometimes this
            # could hit a provider API.
            'social.pipeline.social_auth.social_details',

            # Get the social uid from whichever service we're authing thru. The uid is
            # the unique identifier of the given user in the provider.
            'social.pipeline.social_auth.social_uid',

            # Verifies that the current auth process is valid within the current
            # project, this is were emails and domains whitelists are applied (if
            # defined).
            'social.pipeline.social_auth.auth_allowed',

            # Checks if the current social-account is already associated in the site.
            'social.pipeline.social_auth.social_user',

            # Make up a username for this person, appends a random string at the end if
            # there's any collision.
            'social.pipeline.user.get_username',

            # Send a validation email to the user to verify its email address.
            # 'social.pipeline.mail.mail_validation',

            # Associates the current social details with another user account with
            # a similar email address.
            'social.pipeline.social_auth.associate_by_email',

            # Create a user account if we haven't found one yet.
            'social.pipeline.user.create_user',

            # Create the record that associated the social account with this user.
            'assembl.auth.social_auth.associate_user',

            # Populate the extra_data field in the social record with the values
            # specified by settings (and the default ones like access_token, etc).
            'social.pipeline.social_auth.load_extra_data',

            # Update the user record with any changed info from the auth service.
            'assembl.auth.social_auth.user_details'
        )