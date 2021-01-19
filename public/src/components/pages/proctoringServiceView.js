import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";

class ProctoringServicePayloadView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("proctoringServicePayloadData")
      .then(result => result.json())
      .then(proctoringServicePayload => {
        this.setState({
          header: proctoringServicePayload.header,
          body: proctoringServicePayload.body,
          jwt: proctoringServicePayload.jwt,
          startAssessmentUrl: proctoringServicePayload.start_assessment_url,
        });
      });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Proctoring Service Launch
        </Typography>
        <div>
          <Typography variant="body1" gutterBottom>
            We have received your proctoring service launch.
          </Typography>
          <Typography variant="body1">
            What would you like to do?
          </Typography>
          <form action={this.state.startAssessmentUrl} method="post">
            <input type="hidden" name="JWT" defaultValue={this.state.jwt} />
            <input type="submit" value="Start Assessment" />
          </form>
          <br />
          <Typography variant="h5">
            Proctoring Service Request
          </Typography>
          <Typography variant="body1">
            <b>JWT Header</b>
          </Typography>
          <JSONTree data={this.state.header} hideRoot={true} theme={styles.monokai} invertTheme={true} />
          <Typography variant="body1">
            <b>JWT Body</b>
          </Typography>
          <JSONTree data={this.state.body} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        </div>
      </div>
    );
  }
}

export default ProctoringServicePayloadView;
