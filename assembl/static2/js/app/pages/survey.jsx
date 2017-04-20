import React from 'react';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { I18n, Translate } from 'react-redux-i18n';
import { Grid, Button } from 'react-bootstrap';
import Modal from '../components/common/modal';
import Loader from '../components/common/loader';
import Video from '../components/debate/survey/video';
import Header from '../components/debate/survey/header';
import Question from '../components/debate/survey/question';
import Navigation from '../components/debate/survey/navigation';
import Proposals from '../components/debate/survey/proposals';

class Survey extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      moreProposals: false,
      showModal: false
    };
    this.showMoreProposals = this.showMoreProposals.bind(this);
    this.getIfProposals = this.getIfProposals.bind(this);
    this.redirectToLogin = this.redirectToLogin.bind(this);
  }
  redirectToLogin() {
    const { connectedUserId } = this.props.context;
    if(connectedUserId){
      this.setState({
        showModal: false
      });
    } else {
      this.setState({
        showModal: true
      });
    }
  }
  render() {
    const { loading, theme } = this.props.data;
    const { rootPath, connectedUserId } = this.props.context;
    const { debateData } = this.props.debate;
    return (
      <div className="survey">
        {loading && <Loader color="black" />}
        {theme &&
          <div className="relative">
            <Header title={theme.title} imgUrl={theme.imgUrl} />
            <Modal
              body={I18n.t('debate.survey.modalBody')}
              link={`${rootPath}${debateData.slug}/login`}
              footer={I18n.t('debate.survey.modalFooter')}
              showModal={this.state.showModal}
            />
            {theme.video &&
              <Video
                title={theme.video.title}
                description={theme.video.description}
                htmlCode={theme.video.htmlCode}
              />
            }
            <div className="questions">
              {theme.questions && theme.questions.map((question, index) => {
                return (
                  <Question
                    redirectToLogin={this.redirectToLogin}
                    title={question.title}
                    index={index + 1}
                    key={index}
                  />
                );
              })}
            </div>
            {theme.questions &&
              <Navigation questionsLength={theme.questions.length} />
            }
            <div className="proposals">
              <section className="proposals-section" id="proposals">
                <Grid fluid className="background-light">
                  <div className="max-container">
                    <div className="title-section">
                      <div className="title-hyphen">&nbsp;</div>
                      <h1 className="dark-title-1">
                        <Translate value="debate.survey.proposalsTitle" />
                      </h1>
                    </div>
                    <div className="content-section center">
                      {theme.questions && theme.questions.map((question, index) => {
                        return (
                          <Proposals
                            title={question.title}
                            posts={question.posts}
                            moreProposals={this.state.moreProposals}
                            questionIndex={index + 1}
                            redirectToLogin={this.redirectToLogin}
                            key={index}
                          />
                        );
                      })}
                      {(!this.state.moreProposals && this.getIfProposals(theme.questions)) &&
                        <Button className="button-submit button-dark" onClick={this.showMoreProposals}>
                          <Translate value="debate.survey.moreProposals" />
                        </Button>
                      }
                    </div>
                  </div>
                </Grid>
              </section>
            </div>
          </div>
        }
      </div>
    );
  }
  showMoreProposals() {
    this.setState({
      moreProposals: true
    });
  }
  getIfProposals(questions) {
    if (!questions) return false;
    let isProposals = false;
    questions.forEach((question) => {
      if (question.posts) isProposals = true;
    });
    return isProposals;
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
    theme: node(id: $id) {
      ... on Thematic {
        title(lang: $lang),
        imgUrl,
        video(lang: $lang){
          title,
          description,
          htmlCode
        }
        questions {
          ... on Question {
            title(lang: $lang),
            posts{
              ... on PropositionPost {
                id,
                body,
                sentimentCounts{
                  like,
                  disagree
                }
              }
            }
          }
        }
      }
    }
  }
`;

const SurveyWithData = graphql(ThemeQuery)(Survey);

const mapStateToProps = (state) => {
  return {
    lang: state.i18n.locale,
    context: state.context,
    debate: state.debate
  };
};

export default connect(mapStateToProps)(SurveyWithData);