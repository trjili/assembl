import React from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import Loader from '../components/common/loader';
import Video from '../components/debate/survey/video';
import Header from '../components/debate/survey/header';
import Questions from '../components/debate/survey/questions';
import Navigation from '../components/debate/survey/navigation';
import Proposals from '../components/debate/survey/proposals';

class Survey extends React.Component {
  render() {
    const { loading, theme } = this.props.data;
    return (
      <div className="survey">
        {loading && <Loader color="black" />}
        {theme &&
          <div>
            <Header title={theme.title} imgUrl={theme.imgUrl} />
            {theme.video &&
              <Video title={theme.video.title} description={theme.video.description} htmlCode={theme.video.htmlCode} />
            }
            {theme.questions && theme.questions.map((question, index) => {
              return(
                <Questions title={question.title} key={`question-${index}`} />
              )
            })}
            {theme.questions && 
              <Navigation />
            }
            <Proposals />
          </div>
        }
      </div>
    );
  }
}

Survey.propTypes = {
  data: React.PropTypes.shape({
    loading: React.PropTypes.bool.isRequired,
    error: React.PropTypes.object,
    theme: React.PropTypes.Array
  }).isRequired
};

const ThemeQuery = gql`
  query ThemeQuery($lang: String!, $id: ID!) {
    theme: idea(id: $id) {
      ... on Thematic {
        title(lang: $lang),
        imgUrl,
        video{
          title,
          description,
          htmlCode
        }
      }
      questions: ideas {
        ... on Idea {title}
      }
    }
  }
`;

const SurveyWithData = graphql(ThemeQuery)(Survey);

const mapStateToProps = (state) => {
  return {
    lang: state.i18n.locale
  };
};

export default connect(mapStateToProps)(SurveyWithData);