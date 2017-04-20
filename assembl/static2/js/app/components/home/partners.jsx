import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Grid } from 'react-bootstrap';
import { Translate } from 'react-redux-i18n';
import { fetchPartners } from '../../actions/partnersActions';
import Loader from '../common/loader';
import Error from '../common/error';

class Partners extends React.Component {
  componentWillMount() {
    const { debateId } = this.props.context;
    this.props.fetchPartners(debateId);
  }
  render() {
    const { partners, partnersLoading, partnersError } = this.props.partners;
    return (
      <section className="partners-section">
        {partnersLoading && <Loader color="black" />}
        {(partners && partners.length > 0) &&
          <Grid fluid className="background-light">
            <div className="max-container">
              <div className="title-section">
                <div className="title-hyphen">&nbsp;</div>
                <h1 className="dark-title-1">
                  <Translate value="home.partners" />
                </h1>
              </div>
              <div className="content-section">
                <div className="content-margin">
                  {partners.map((partner) => {
                    return (
                      <div className="partner-logo" key={partner['@id']}>
                        <Link to={`${partner.homepage}`} target="_blank">
                          <img src={partner.logo} alt={partner.name} />
                        </Link>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </Grid>
        }
        {partnersError && <Error errorMessage={partnersError} />}
      </section>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    partners: state.partners,
    context: state.context
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    fetchPartners: (debateId) => {
      dispatch(fetchPartners(debateId));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(Partners);