import Button from "@material-ui/core/Button";
import ExpandMoreIcon from "@material-ui/icons/ExpandMore";
import ExpansionPanel from "@material-ui/core/ExpansionPanel";
import ExpansionPanelDetails from "@material-ui/core/ExpansionPanelDetails";
import ExpansionPanelSummary from "@material-ui/core/ExpansionPanelSummary";
import JSONInput from 'react-json-editor-ajrm';
import React from "react";
import Typography from "@material-ui/core/Typography";
import locale from 'react-json-editor-ajrm/locale/en';
import {styles} from "../../common/styles/custom.js";
import Grid from "@material-ui/core/Grid";


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
        <Button variant="contained" type={"submit"} color={"secondary"}>Names and Roles</Button>
        <input type="hidden" name="body" value={body} />
      </form>
    ) : (
      <Typography variant="body1" style={styles.notAvailable}>
        <b>Names and Roles not available</b>
      </Typography>
    );
    const grading = this.state.grading ? (
      <form action="/assignAndGrades" method="POST">
        <Button variant={"contained"} type="submit" color={"secondary"}>Assignments and Grades</Button>
        <input type="hidden" name="body" value={body} />
      </form>
    ) : (
      <Typography variant="body1" style={styles.notAvailable}>
        <b>Assignments and Grades not available</b>
      </Typography>
    );
    const groups = this.state.groups ? (
      <form action="/groups" method="POST">
        <Button variant={"contained"} type="submit" color={"secondary"}>Groups</Button>
        <input type="hidden" name="body" value={body}/>
      </form>
    ) : (
      <Typography variant="body1" style={styles.notAvailable}>
        <b>Groups not available</b>
      </Typography>
    );
    const groupSets = this.state.groups ? (
      <form action="/groupsets" method="POST">
        <Button variant={"contained"} type="submit" color={"secondary"}>Group Sets</Button>
        <input type="hidden" name="body" value={body}/>
      </form>
    ) : (
      <Typography variant="body1" style={styles.notAvailable}>
        <b>Group Sets not available</b>
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
          <Typography variant="body1" gutterBottom>
            What would you like to do?
          </Typography>
          <Grid
            container
            direction={"column"}
            spacing={8}>
            <Grid item xs>
              <form action={this.state.returnUrl} method="post">
                <Button variant={"contained"} type="submit" color={"secondary"}>Return to Learn</Button>
              </form>
            </Grid>
            <Grid item xs>
              <form action={msgReturn} method="post">
                <Button variant={"contained"} type="submit" color={"secondary"}>Return with Message</Button>
              </form>
            </Grid>
            <Grid item xs>
              <form action={errorReturn} method="post">
                <Button variant={"contained"} type="submit" color={"secondary"}>Return with Error</Button>
              </form>
            </Grid>
            <Grid item xs>
              {namesRoles}
            </Grid>
            <Grid item xs>
              {grading}
            </Grid>
            <Grid item xs>
              {groups}
            </Grid>
            <Grid item xs>
              {groupSets}
            </Grid>
          </Grid>

          <br />
          <Typography variant="h5">
            Resource Launch
          </Typography>
          <Typography variant="body1">
            <b>JWT Header</b>
          </Typography>
          <JSONInput
            id='jwt_header'
            viewOnly={true}
            confirmGood={false}
            placeholder={this.state.header}
            theme={"dark_vscode_tribute"}
            locale={locale}
            height="100px"
            width={"500px"}
          /> <br/>
          {verified ?
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography variant="body1">
                  <b>JWT Body</b>
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <JSONInput
                  id='jwt_body'
                  viewOnly={true}
                  confirmGood={false}
                  placeholder={this.state.body}
                  theme={"dark_vscode_tribute"}
                  style={{body: styles.jsonEditor}}
                  locale={locale}
                  height="100%"
                  width={"100%"}
                />
              </ExpansionPanelDetails>
            </ExpansionPanel>
            :
            <Typography variant={'h4'}>
              Not verified
            </Typography>}
        </div>
      </div>
    );
  }
}

export default LtiAdvView;
