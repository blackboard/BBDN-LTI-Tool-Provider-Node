import React from "react";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";

class ProctoringServiceActionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("getProctoringServicePayloadData")
      .then(result => result.json())
      .then(proctoringServicePayload => {
        this.setState({
          jwt: proctoringServicePayload.jwt,
          decodedJwt: proctoringServicePayload.decodedJwt,
          startAssessmentUrl: proctoringServicePayload.start_assessment_url,
          errorUrl: proctoringServicePayload.error_url,
        });
      });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Proctoring Actions
        </Typography>
        <div>
          <Typography variant="body1" gutterBottom>
            Choose Start Assessment to send a response JWT (shown below) to the request's start_assessment_url.
          </Typography>
          <Typography variant="body1">
            Choose Return Error to call the request's launch_presentation URL. Any message options will be included as URL parameters.
          </Typography>
          <br />
          <form action={this.state.startAssessmentUrl} method="post">
            <input type="hidden" name="JWT" defaultValue={this.state.jwt} />
            <input type="submit" value="Start Assessment" />
          </form>
          <br />
          <form action={this.state.errorUrl} method="post">
            <input type="submit" value="Return Error" />
          </form>
        </div>
        <br />
        {this.state.decodedJwt &&
          <div>
            <Typography variant="body1">
              <b>JWT Header</b>
            </Typography>
            <JSONInput
              id='jwt_header'
              viewOnly={true}
              confirmGood={false}
              placeholder={this.state.header}
              theme={"dark_vscode_tribute"}
              style={{body: styles.jsonEditor}}
              locale={locale}
              height="500px"
              width={"100%"}
            />
            <Typography variant="body1">
              <b>JWT Body</b>
            </Typography>
            <JSONInput
              id='jwt_body'
              viewOnly={true}
              confirmGood={false}
              placeholder={this.state.body}
              theme={"dark_vscode_tribute"}
              style={{body: styles.jsonEditor}}
              locale={locale}
              height="1500px"
              width={"100%"}
            />
          </div>
        }
      </div>
    );
  }
}

export default ProctoringServiceActionsView;
