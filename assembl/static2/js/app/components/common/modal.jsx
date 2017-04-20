import React from 'react';
import { Link } from 'react-router';
import { Modal } from 'react-bootstrap';

class AssemblModal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      showModal: false
    };
    this.close = this.close.bind(this);
    this.open = this.open.bind(this);
  }
  componentWillReceiveProps(nextProps) {
    this.setState({
      showModal: nextProps.showModal
    });
  }
  close() {
    this.setState({
      showModal: false
    });
  }
  open() {
    this.setState({
      showModal: true
    });
  }
  render() {
    const { title, body, footer, footerTxt, button } = this.props;
    return (
      <Modal show={this.state.showModal} onHide={this.close}>
        <Modal.Header closeButton>
          {title &&
            <Modal.Title>{ title }</Modal.Title>
          }
        </Modal.Header>
        {body &&
          <Modal.Body>
            <div>{ body }</div>
          </Modal.Body>
        }
        {footer &&
          <Modal.Footer>
            {footerTxt &&
              <div>{ footerTxt }</div>
            }
            {button.internalLink ? <Link to={button.link} className="button-link button-dark">{ button.label }</Link> : <a href={button.link}>{ button.label }</a>
            }
          </Modal.Footer>
        }
      </Modal>
    );
  }
}

export default AssemblModal;