"""Making discussion.owner_id non-nullable

Revision ID: 22290edc94b7
Revises: 115b4d7ab81
Create Date: 2013-08-14 14:36:02.294325

"""

# revision identifiers, used by Alembic.
revision = '22290edc94b7'
down_revision = '115b4d7ab81'

from alembic import context, op
import sqlalchemy as sa
import transaction


from assembl import models as m
from assembl.lib import config

db = m.DBSession


def upgrade(pyramid_env):
    with context.begin_transaction():
        ### commands auto generated by Alembic - please adjust! ###
        op.alter_column(u'discussion', u'owner_id',
                   existing_type=sa.INTEGER(),
                   nullable=False)
        ### end Alembic commands ###

    # Do stuff with the app's models here.
    with transaction.manager:
        pass


def downgrade(pyramid_env):
    with context.begin_transaction():
        ### commands auto generated by Alembic - please adjust! ###
        op.alter_column(u'discussion', u'owner_id',
                   existing_type=sa.INTEGER(),
                   nullable=True)
        ### end Alembic commands ###
