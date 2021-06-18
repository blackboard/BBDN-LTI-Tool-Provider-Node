import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import locale from 'react-json-editor-ajrm/locale/en';
import { Typography } from '@material-ui/core';
import { styles } from '../../common/styles/custom.js';
import parameters from "../../util/parameters";

const params = parameters.getInstance();

export default class ProctoringServiceActionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch(`getProctoringPayloadData?nonce=${params.getNonce()}`)
      .then(result => result.json())
      .then(proctoringServicePayload => {
        this.setState({
          jwt: proctoringServicePayload.jwt,
          decodedJwt: proctoringServicePayload.decodedJwt,
          startAssessmentUrl: proctoringServicePayload.start_assessment_url,
          returnUrl: proctoringServicePayload.return_url,
        });
      });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Proctoring Start: Actions
        </Typography>
        <br/>
        <div style={{ marginBottom: '20px' }}>
          <Typography variant="h5">
            Actions
          </Typography>
          <br/>
          <Typography variant="body1" gutterBottom>
            Choose Start Assessment to send a response JWT (shown below) to the request's start_assessment_url.
          </Typography>
          <Typography variant="body1">
            Choose Return to call the request's launch_presentation URL. Any message options will be included as URL
            parameters.
          </Typography>
          <br/>
          <form action={this.state.startAssessmentUrl} method="post">
            <input type="hidden" name="JWT" defaultValue={this.state.jwt}/>
            <input type="submit" value="Start Assessment"/>
          </form>
          <br/>
          <form action={this.state.returnUrl} method="post">
            <input type="submit" value="Return"/>
          </form>
        </div>
        <br/>
        {this.state.decodedJwt &&
        <div>
          <Typography variant="h6">
            Response JWT
          </Typography>
          <JSONInput
            id="jwt_header"
            viewOnly={true}
            confirmGood={false}
            placeholder={this.state.decodedJwt.header}
            theme={'dark_vscode_tribute'}
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height="100%"
            width="100%"
          />
          <Typography variant="h6">
            <b>JWT Body</b>
          </Typography>
          <JSONInput
            id="jwt_body"
            viewOnly={true}
            confirmGood={true}
            placeholder={this.state.decodedJwt.payload}
            theme={'dark_vscode_tribute'}
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height="100%"
            width={'100%'}
          />
        </div>
        }
      </div>
    );
  }
}
