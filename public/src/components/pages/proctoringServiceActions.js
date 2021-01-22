import React from "react";
import Typography from "@material-ui/core/Typography";
import JSONTree from "react-json-tree";
import {styles} from "../../common/styles/custom.js";

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
            <Typography variant="h5">
              Response JWT
            </Typography>
            <br />
            <Typography variant="body1">
                <b>JWT Header</b>
            </Typography>
            <JSONTree data={this.state.decodedJwt.header} hideRoot={true} theme={styles.monokai} invertTheme={true} />
            <Typography variant="body1">
              <b>JWT Body</b>
            </Typography>
            <JSONTree data={this.state.decodedJwt.payload} hideRoot={true} theme={styles.monokai} invertTheme={true} />
          </div>
        }
      </div>
    );
  }
}

export default ProctoringServiceActionsView;
