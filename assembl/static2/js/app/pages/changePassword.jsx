/* eslint no-alert: "off" */

import React from 'react';
import { Grid, Col, FormGroup, FormControl, Button } from 'react-bootstrap';
import { Translate, I18n } from 'react-redux-i18n';
import { getAuthorizationToken, getDiscussionSlug } from '../utils/globalFunctions';
import { postChangePassword } from '../services/authenticationService';
import inputHandler from '../utils/inputHandler';
import { get } from '../utils/routeMap';
import { displayAlert } from '../utils/utilityManager';

class ChangePassword extends React.Component {
  constructor(props) {
    super(props);
    this.handleChangePassword = this.handleChangePassword.bind(this);
    this.submitForm = this.submitForm.bind(this);

    this.state = {
      token: getAuthorizationToken(this.props.location)
    };
  }

  handleChangePassword(e) {
    inputHandler(this, e);
  }

  submitForm(e) {
    e.preventDefault();
    const payload = this.state;
    const that = this;
    postChangePassword(payload).then(() => {
      const slug = getDiscussionSlug();
      let route, url;
      if (slug) {
        route = `/${get('home', { slug: slug })}`;
        url = new URL(route, that.props.location.origin);
        window.location = url;
      }
      else {
        route = `/${get('root')}`;
        url = new URL(route, that.props.location.origin);
        window.location = url;
      }
    })
    .catch((error) => {
      let msg;
      if (error instanceof Error) {
        if (error.name === 'PasswordMismatchError') {
          msg = I18n.t('login.incorrectPassword');
          displayAlert('danger', msg, true);
        }
      } else {
        try {
          const firstError = error[0];
          displayAlert('danger', firstError.message, true);
        } catch (exception) {
          msg = I18n.t('login.somethingWentWrong');
          displayAlert('danger', msg, true);
        }
      }
    });
  }

  render() {
    return (
      <Grid fluid className="login-grid">
        <Col xs={12} md={6} className="login-container col-centered center">
          <div className="box-title">
            <Translate value="login.changePassword" />
          </div>
          <div className="box">
            <form>
              <FormGroup className="margin-m">
                <FormControl
                  type="password"
                  name="password1"
                  required
                  placeholder={I18n.t('login.newPassword')}
                  onChange={this.handleChangePassword}
                />
              </FormGroup>
              <FormGroup className="margin-m">
                <FormControl
                  type="password"
                  name="password2"
                  required
                  placeholder={I18n.t('login.newPassword2')}
                  onChange={this.handleChangePassword}
                />
              </FormGroup>
              <FormGroup className="margin-l">
                <Button
                  type="submit"
                  name="change_password"
                  value={I18n.t('login.changePassword')} className="button-submit button-dark"
                  onClick={this.submitForm}
                >
                  <Translate value="login.changePassword" />
                </Button>
              </FormGroup>
            </form>
          </div>
        </Col>
      </Grid>
    );
  }
}


export default ChangePassword;