import React from 'react';
import { connect } from 'react-redux';
import { Translate } from 'react-redux-i18n';
import Loader from '../../common/loader';
import Error from '../../common/error';

class Statistic extends React.Component {
  render() {
    const { posts, postsLoading, postsError } = this.props.posts;
    const { users, usersLoading, usersError } = this.props.users;
    return (
      <div className="statistic">
        <div className="inline">
          {postsLoading &&
            <div className="stat-loader">
              <Loader loading={postsLoading} textHidden color="white" />
            </div>
          }
          {postsError && <Error errorMessage={postsError} />}
          {posts &&
            <div className="stat-box border-right">
              <div className="stat-icon assembl-icon-message white">&nbsp;</div>
              <div className="stat">
                <div className="stat-nb">{posts.total}&nbsp;</div>
                <div className="stat-nb">
                  <Translate value="home.contribution" />
                </div>
              </div>
            </div>
          }
        </div>
        <div className="inline">
          {usersLoading && <Loader textHidden color="white" />}
          {usersError && <Error errorMessage={usersError} />}
          {users &&
            <div className="stat-box">
              <div className="stat-icon assembl-icon-profil white">&nbsp;</div>
              <div className="stat">
                <div className="stat-nb">{users.totalVerifiedUsers}&nbsp;</div>
                <div className="stat-nb">
                  <Translate value="home.participant" />
                </div>
              </div>
            </div>
          }
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    posts: state.posts,
    users: state.users
  };
};

export default connect(mapStateToProps)(Statistic);