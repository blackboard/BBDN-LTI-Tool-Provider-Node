import React from "react";
import {Button, ButtonToolbar, FormGroup, FormControl, ControlLabel} from 'react-bootstrap';
const EmptyResponse = (
  <div>
    <table>
      <tbody>
      <tr>
        <td>Status</td>
        <td >N/A</td>
        <td >N/A</td>
      </tr>
      <tr>
        <td>Body</td>
        <td colSpan="2">N/A</td>
      </tr>

      </tbody>
    </table>
  </div>);

class Response extends React.Component {
  constructor(props) {
    super(props);
  }

  render() {
    if (!this.props.response) {
      return EmptyResponse;
    }

    if (this.props.response.status == 404 || this.props.response.status == 400) {
      return (
        <div>

          <table>
            <tbody>
            <tr>
              <td>Status</td>
              <td >{this.props.response.status}</td>
              <td >{this.props.response.message}</td>
            </tr>
            </tbody>
          </table>
        </div>
      );
    } else if (this.props.response.status == 200) {
      return (
        <div>

          <table>
            <tbody>
            <tr>
              <td>Status</td>
              <td >{this.props.response.status}</td>
              <td >{this.props.response.message}</td>
            </tr>
            </tbody>
          </table>
          <FormGroup>

            <ControlLabel>Response Body</ControlLabel>
            <FormControl componentClass="textarea" value={this.props.response.body} placeholder="textarea" />

          </FormGroup>
        </div>
      );
    }
  }
}


module.exports = Response;