import React from 'react';
import { PropTypes } from 'prop-types';
import { connect } from 'react-redux';
import { graphql } from 'react-apollo';
import gql from 'graphql-tag';
import { Translate } from 'react-redux-i18n';
import Loader from '../components/common/loader';
import Themes from '../components/debate/common/themes';
import Timeline from '../components/debate/navigation/timeline';
import Thumbnails from '../components/debate/navigation/thumbnails';
import { get } from '../utils/routeMap';
import { displayModal } from '../utils/utilityManager';

class Debate extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isThumbnailsHidden: true
    };
    this.showThumbnails = this.showThumbnails.bind(this);
    this.hideThumbnails = this.hideThumbnails.bind(this);
    this.displayThumbnails = this.displayThumbnails.bind(this);
    this.redirectToV1Threads = this.redirectToV1Threads.bind(this);
  }
  showThumbnails() {
    this.setState({ isThumbnailsHidden: false });
  }
  hideThumbnails() {
    setTimeout(() => {
      this.setState({ isThumbnailsHidden: true });
    }, 400);
  }
  displayThumbnails() {
    this.setState({ isThumbnailsHidden: !this.state.isThumbnailsHidden });
  }
  redirectToV1Threads() {
    const body = <Translate value="debate.redirectToThreadPhase" />;
    displayModal(null, body, true, null, null, true);
    const { debateData } = this.props.debate;
    const slug = { slug: debateData.slug };
    const redirectionURL = get('oldDebate', slug);
    setTimeout(function(){
      location.href = redirectionURL;
    }, 6000);
  }
  render() {
    const { loading, thematics } = this.props.data;
    const { identifier, isNavbarHidden } = this.props;
    const isParentRoute = !this.props.params.phase || false;
    const themeId = this.props.params.themeId || null;

    if (isParentRoute && identifier == "thread") {
      // This setTimeout avoids React error related to state change. Refactoring welcome.
      setTimeout(this.redirectToV1Threads, 100);
    }

    const children = React.Children.map(this.props.children, (child) => {
      return React.cloneElement(child, {
        id: themeId,
        identifier: identifier
      });
    });
    return (
      <div className="debate">
        {loading && <Loader color="black" />}
        {thematics &&
          <div>
            <section className={isNavbarHidden ? 'timeline-section timeline-top' : 'timeline-section timeline-shifted'} id="timeline">
              <div className="max-container">
                {!isParentRoute &&
                  <div className="burger-menu grey" onMouseOver={this.showThumbnails} onClick={this.displayThumbnails}>
                    <div className="assembl-icon-thumb" />
                    <div className="burger-menu-label">
                      <Translate value="debate.themes" />
                    </div>
                  </div>
                }
                <Timeline
                  showNavigation={!isParentRoute}
                  identifier={identifier}
                />
              </div>
            </section>
            {isParentRoute && identifier != "thread" &&
              <Themes
                thematics={thematics}
                identifier={identifier}
              />
            }
            {!isParentRoute &&
              <section className="debate-section">
                <div className={this.state.isThumbnailsHidden ? 'hiddenThumb' : 'shown'} onMouseLeave={this.hideThumbnails}>
                  <Thumbnails
                    showNavigation={!isParentRoute}
                    thematics={thematics}
                    identifier={identifier}
                    themeId={themeId}
                    isNavbarHidden={isNavbarHidden}
                  />
                </div>
                {children}
              </section>
            }
          </div>
        }
      </div>
    );
  }
}

Debate.propTypes = {
  data: PropTypes.shape({
    loading: PropTypes.bool.isRequired,
    error: PropTypes.object,
    thematics: PropTypes.Array
  }).isRequired
};

const ThematicQuery = gql`
  query ThematicQuery($lang: String!, $identifier: String!) {
    thematics(identifier: $identifier) {
      ... on Thematic {
        id,
        identifier,
        title(lang: $lang),
        description(lang: $lang),
        numPosts,
        numContributors,
        imgUrl
      }
    }
  }
`;

const DebateWithData = graphql(ThematicQuery)(Debate);

const mapStateToProps = (state) => {
  return {
    debate: state.debate,
    lang: state.i18n.locale
  };
};

export default connect(mapStateToProps)(DebateWithData);