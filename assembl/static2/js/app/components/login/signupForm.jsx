import React from 'react';
import { connect } from 'react-redux';
import { Translate, I18n } from 'react-redux-i18n';
import { form, FormGroup, FormControl, Button } from 'react-bootstrap';
import { Link } from 'react-router';
import { signupAction } from '../../actions/authenticationActions';
import { getDiscussionSlug } from '../../utils/globalFunctions';
import { get, getContextual } from '../../utils/routeMap';
import inputHandler from '../../utils/inputHandler';
import { displayAlert } from '../../utils/utilityManager';

class SignupForm extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      name: null,
      email: null,
      password1: null,
      password2: null
    };

    this.signupHandler = this.signupHandler.bind(this);
    this.handleInput = this.handleInput.bind(this);
  }

  componentWillReceiveProps(nextProps) {
    const { auth } = nextProps;
    let msg;
    if (auth.signupSuccess.success === false) {
      const { reason } = auth.signupSuccess;
      switch (reason) {
      case 'password': {
        msg = I18n.t('login.incorrectPassword');
        break;
      }
      case 'general': {
        const firstError = auth.signupSuccess.data[0];
        msg = firstError.message;
        break;
      }
      default: {
        msg = I18n.t('login.somethingWentWrong');
        break;
      }
      }
      displayAlert('danger', msg, true);
    }
  }

  handleInput(e) {
    inputHandler(this, e);
  }

  signupHandler(e) {
    e.preventDefault();
    const slug = getDiscussionSlug();
    if (slug) { this.props.signUp({ ...this.state, discussionSlug: slug }); } else { this.props.signUp(this.state); }
  }

  render() {
    let { debateData } = this.props.debate;
    if (!debateData) {
      // Non-contextual signup process
      debateData = {};
      debateData.topic = I18n.t('login.createAccount');
      debateData.slug = null;
    }
    return (
      <div className="login-view">
        <div className="box-title">{debateData.topic}</div>
        <div className="box">
          <form className="signup" onSubmit={this.signupHandler}>
            <FormGroup className="margin-m">
              <FormControl
                type="text"
                name="name"
                required
                placeholder={I18n.t('login.fullName')}
                onChange={this.handleInput}
              />
            </FormGroup>
            <FormGroup>
              <FormControl
                type="text"
                name="username"
                placeholder={I18n.t('login.userName')}
                onChange={this.handleInput}
              />
            </FormGroup>

            <FormGroup>
              <FormControl
                type="email"
                name="email"
                required
                placeholder={I18n.t('login.email')}
                onChange={this.handleInput}
              />
            </FormGroup>
            <FormGroup>
              <FormControl
                type="password"
                name="password1"
                required
                placeholder={I18n.t('login.password')}
                onChange={this.handleInput}
              />
            </FormGroup>
            <FormGroup>
              <FormControl
                type="password"
                name="password2"
                required
                placeholder={I18n.t('login.password2')}
                onChange={this.handleInput}
              />
            </FormGroup>
            <FormGroup>
              <Button
                type="submit"
                name="register"
                value={I18n.t('login.signUp')}
                className="button-submit button-dark margin-m"
              >
                <Translate value="login.signUp" />
              </Button>
            </FormGroup>
            <FormGroup>
              <Translate value="login.alreadyAccount" />
              <span>&nbsp;</span>
              <Link
                to={debateData.slug ?
                getContextual('login', { slug: debateData.slug }) : get('login')}
              >
                <Translate value="login.login" />
              </Link>
            </FormGroup>
          </form>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => {
  return {
    debate: state.debate,
    auth: state.auth
  };
};

const mapDispatchToProps = (dispatch) => {
  return {
    signUp: (payload) => {
      dispatch(signupAction(payload));
    }
  };
};

export default connect(mapStateToProps, mapDispatchToProps)(SignupForm);