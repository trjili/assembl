import React from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import { Translate } from 'react-redux-i18n';
import gql from 'graphql-tag';
import { Grid, Row, Col } from 'react-bootstrap';
import Loader from '../common/loader';
import ThematicPreview from '../common/thematicPreview';

class Survey extends React.Component {
  render() {
    const { thematics, loading } = this.props.data;
    const { debateData } = this.props.debate;
    const { rootPath } = this.props.context;
    const { identifier } = this.props;
    return (
      <section className={`${identifier}-section`}>
        {loading && <Loader color="black" />}
        {thematics &&
          <Grid fluid className="background-grey">
            <div className="max-container">
              <div className="title-section">
                <div className="title-hyphen">&nbsp;</div>
                <h1 className="dark-title-1">
                  <Translate value="debate.survey.themesTitle" />
                </h1>
              </div>
              <div className="content-section">
                <Row className="no-margin">
                  {thematics.map((thematic, index) => {
                    return(
                      <Col xs={12} sm={6} md={3} className={index%4 === 0 ? 'theme no-padding clear' : 'theme no-padding'} key={`thematic-${index}`}>
                        <ThematicPreview imgUrl={thematic.imgUrl} numPosts={thematic.numPosts} numContributors={thematic.numContributors} link={`${rootPath}${debateData.slug}/debate/survey/theme/${thematic.id.split(':')[1]}`} title={thematic.title} description={thematic.description} />
                      </Col>
                    )
                  })}
                </Row>
              </div>
            </div>
          </Grid>
        }
      </section>
    );
  }
}

Survey.propTypes = {
  data: React.PropTypes.shape({
    loading: React.PropTypes.bool.isRequired,
    error: React.PropTypes.object,
    thematics: React.PropTypes.Array,
  }).isRequired,
};

const ThematicQuery = gql`
  query ThematicQuery($lang: String!) {
   thematics: ideas {
     ... on Thematic {
       id,
       title(lang: $lang),
       description,
       numPosts,
       numContributors,
       imgUrl
     }
   }
  }
`;

const SurveyWithData = graphql(ThematicQuery)(Survey);

const mapStateToProps = (state) => {
  return {
    lang: state.i18n.locale,
    debate: state.debate,
    context: state.context
  };
};

export default connect(mapStateToProps)(SurveyWithData);