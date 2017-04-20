import React from 'react';
import { Link } from 'react-router';
import { Translate } from 'react-redux-i18n';
import { Grid } from 'react-bootstrap';
import { connect } from 'react-redux';
import Glyphicon from './glyphicon';

class Footer extends React.Component {
  render() {
    const { debateData } = this.props.debate;
    const { rootPath } = this.props.context;
    return (
      <Grid fluid className="background-dark relative">
        <div className="max-container">
          <div className={debateData.socialMedias ? 'footer' : 'footer margin-xl'}>
            {debateData.socialMedias &&
              <div>
                <p><Translate value="footer.socialMedias" /></p>
                <div className="social-medias">
                  {debateData.socialMedias.map((sMedia) => {
                    return (
                      <Link to={sMedia.url} target="_blank" key={sMedia.title}>
                        <Glyphicon glyph={sMedia.title} color="white" size={30} desc={sMedia.title} />
                      </Link>
                    );
                  })}
                </div>
              </div>
            }
            <div className="terms">
              <Link to={`${rootPath}${debateData.slug}/terms`}><Translate value="footer.terms" /></Link>
            </div>
            <div className="copyright">© <Link to="http://assembl.bluenove.com/" target="_blank">Assembl</Link> powered by <Link to="http://bluenove.com/" target="_blank">bluenove</Link></div>
          </div>
        </div>
      </Grid>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    debate: state.debate,
    context: state.context
  };
};

export default connect(mapStateToProps)(Footer);