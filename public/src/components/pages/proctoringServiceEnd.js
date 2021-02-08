import React from "react";
import Typography from "@material-ui/core/Typography";

/**
 * We should see this view if one of the following has happened:
 * 1. An error occurred while student was taking assessment
 * 2. The attempt has been submitted and we specified end_assessment_return=true in LtiStartAssessment
 */
class ProctoringServiceEndView extends React.Component {

  componentDidMount() {
    fetch("getProctoringServicePayloadData")
      .then(result => result.json())
      .then(proctoringServicePayload => {
        this.setState({
          header: proctoringServicePayload.header,
          body: proctoringServicePayload.body,
        });
      });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Proctoring End
        </Typography>
        <br />
        <Typography variant="body1">
          <b>JWT Header</b>
        </Typography>
        {this.state.header &&
          <JSONTree data={this.state.header} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        }
        <Typography variant="body1">
          <b>JWT Body</b>
        </Typography>
        {this.state.body &&
          <JSONTree data={this.state.body} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        }
      </div>
    );
  }
}

export default ProctoringServiceEndView;
