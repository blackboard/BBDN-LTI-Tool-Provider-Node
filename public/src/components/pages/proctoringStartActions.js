import React from "react";
import Typography from "@material-ui/core/Typography";
import JSONTree from "react-json-tree";
import {styles} from "../../common/styles/custom.js";
import {parameters} from "../../util/parameters";

const params = parameters.getInstance();

class ProctoringServiceActionsView extends React.Component {
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
        <br />
        <div style={{ marginBottom: '20px' }}>
          <Typography variant="h5">
            Actions
          </Typography>
          <br />
          <Typography variant="body1" gutterBottom>
            Choose Start Assessment to send a response JWT (shown below) to the request's start_assessment_url.
          </Typography>
          <Typography variant="body1">
            Choose Return to call the request's launch_presentation URL. Any message options will be included as URL parameters.
          </Typography>
          <br />
          <form action={this.state.startAssessmentUrl} method="post">
            <input type="hidden" name="JWT" defaultValue={this.state.jwt} />
            <input type="submit" value="Start Assessment" />
          </form>
          <br />
          <form action={this.state.returnUrl} method="post">
            <input type="submit" value="Return" />
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
