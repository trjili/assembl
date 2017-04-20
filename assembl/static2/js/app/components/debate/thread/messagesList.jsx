import React from 'react';
import { connect } from 'react-redux';
import { Grid, Row } from 'react-bootstrap';
import Loader from '../../common/loader';
import Error from '../../common/error';

class Thread extends React.Component {
  render() {
    const { posts, postsLoading, postsError } = this.props.posts;
    return (
      <div>
        {postsLoading && <Loader loading={postsLoading} color="black" />}
        {posts &&
          <Grid fluid>
            <Row className="max-container">
              {posts.posts.map((post) => {
                return (
                  <div className="box" key={post['@id']}>
                    {post.body && <div>{post.body.entries[0].value}</div>}
                  </div>
                );
              })}
            </Row>
          </Grid>
        }
        {postsError && <Error errorMessage={postsError} />}
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    posts: state.posts
  };
};

export default connect(mapStateToProps)(Thread);