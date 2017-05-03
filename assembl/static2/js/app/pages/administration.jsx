import React from 'react';
import { Grid, Row, Col } from 'react-bootstrap';
import Menu from '../components/administration/menu';

class Administration extends React.Component {
  render() {
    return (
      <div className="administration">
        <div className="max-container">
          <Grid fluid>
            <Row>
              <Col xs={12} md={4}>
                <Menu />
              </Col>
              <Col xs={12} md={4}>{this.props.children}</Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

export default Administration;