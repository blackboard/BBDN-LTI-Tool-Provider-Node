import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";

class LtiAdvView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("jwtPayloadData")
      .then(result => result.json())
      .then(jwtPayload => {
        this.setState({
          header: jwtPayload.header,
          body: jwtPayload.body,
          returnUrl: jwtPayload.return_url,
          errorUrl: jwtPayload.error_url,
          verified: jwtPayload.verified,
          namesRoles: jwtPayload.names_roles,
          grading: jwtPayload.grading,
          groups: jwtPayload.groups
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.body);
    const verified = this.state.verified ? (
      <Typography variant="body1" style={styles.passed}>
        Verified
      </Typography>
    ) : (
      <Typography variant="body1" style={styles.failed}>
        Verify failed
      </Typography>
    );
    const msgReturn =
      this.state.returnUrl +
      "&lti_msg=" +
      encodeURI("I have a message for you") +
      "&lti_log=" +
      encodeURI("Log this message");
    const errorReturn =
      this.state.errorUrl +
      "&lti_errormsg=" +
      encodeURI("An error has occurred") +
      "&lti_errorlog=" +
      encodeURI("Log this error");
    const namesRoles = this.state.namesRoles ? (
      <form action="/namesAndRoles" method="POST">
        <input type="submit" value="Names and Roles" />
        <input type="hidden" name="body" value={body} />
      </form>
    ) : (
      <Typography variant="body1" style={styles.notAvailable}>
        <b>Names and Roles not available</b>
      </Typography>
    );
    const grading = this.state.grading ? (
      <form action="/assignAndGrades" method="POST">
        <input type="submit" value="submit" value="Assignments and Grades" />
        <input type="hidden" name="body" value={body} />
      </form>
    ) : (
      <Typography variant="body1" style={styles.notAvailable}>
        <b>Assignments and Grades not available</b>
      </Typography>
    );
    const groups = this.state.groups ? (
        <form action="/groups" method="POST">
          <input type="submit" value="Groups" />
          <input type="hidden" name="body" value={body} />
        </form>
    ) : (
        <Typography variant="body1" style={styles.notAvailable}>
          <b>Groups not available</b>
        </Typography>
    );

    return (
      <div>
        <Typography variant="h4" gutterBottom>
          LTI Advantage Launch
        </Typography>

        <div>
          <Typography variant="body1" gutterBottom>
            We have received your LTI launch. You can view the JSON below.
          </Typography>
          <Typography variant="body1">
            What would you like to do?
          </Typography>
          <form action={this.state.returnUrl} method="post">
            <input type="submit" value="Return to Learn" />
          </form>
          <form action={msgReturn} method="post">
            <input type="submit" value="Return with message" />
          </form>
          <form action={errorReturn} method="post">
            <input type="submit" value="Return with error" />
          </form>
          {namesRoles}
          {grading}
          {groups}

          <br />
          <Typography variant="h5">
            Resource Launch
          </Typography>
          {verified}

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

export default LtiAdvView;
