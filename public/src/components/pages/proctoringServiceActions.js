import React from "react";
import Typography from "@material-ui/core/Typography";

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
          startAssessmentUrl: proctoringServicePayload.start_assessment_url,
          errorUrl: proctoringServicePayload.error_url,
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
            Your return payload is ready.
          </Typography>
          <Typography variant="body1">
            What would you like to do with it?
          </Typography>
          <form action={this.state.startAssessmentUrl} method="post">
            <input type="hidden" name="JWT" defaultValue={this.state.jwt} />
            <input type="submit" value="Start Assessment" />
          </form>
          <br />
          <form action={this.state.errorUrl} method="post">
            <input type="submit" value="Return with error" />
          </form>
        </div>
      </div>
    );
  }
}

export default ProctoringServiceActionsView;
