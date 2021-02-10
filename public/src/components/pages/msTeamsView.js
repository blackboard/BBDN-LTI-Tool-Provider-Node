import Button from "@material-ui/core/Button";
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Grid from "@material-ui/core/Grid";
import JSONInput from 'react-json-editor-ajrm';
import Paper from '@material-ui/core/Paper';
import React from "react";
import Typography from "@material-ui/core/Typography";
import locale from 'react-json-editor-ajrm/locale/en';
import {styles} from "../../common/styles/custom.js";

const claimContext = 'https://purl.imsglobal.org/spec/lti/claim/context';
const claimToolPlatform = 'https://purl.imsglobal.org/spec/lti/claim/tool_platform';
const claimRoles = 'https://purl.imsglobal.org/spec/lti/claim/roles';

class MsTeamsView extends React.Component {
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
          groups: jwtPayload.groups,
          user: jwtPayload.body.name,
          userEmail: jwtPayload.body.email,
          userRole: jwtPayload.body[claimRoles],
          course: jwtPayload.body[claimContext].title,
          courseUuid: jwtPayload.body[claimContext].id,
          learnCourseId: jwtPayload.body[claimContext].label,
          learnVersion: jwtPayload.body[claimToolPlatform].version
        });
      });
    fetch("nrPayloadData")
      .then(result => result.json())
      .then(nrPayload => {
        this.setState({
          url: nrPayload.url,
          nrBody: nrPayload.body,
          differenceUrl: nrPayload.difference_url,
          nextUrl: nrPayload.next_url,
          origBody: this.state.body,
        });
      });
  }

  render() {
    const verified = this.state.verified ? (
      <Typography variant="h6" style={styles.passed}>
        Verified
      </Typography>
    ) : (
      <Typography variant="h6" style={styles.failed}>
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
    /*const namesRoles = this.state.namesRoles ? (
      <form action="/namesAndRoles" method="POST">
        <Button variant="contained" type={"submit"} color={"secondary"}>Names and Roles</Button>
        <input type="hidden" name="body" value={JSON.stringify(this.state.body)}/>
      </form>
    ) : (
      <Typography variant="body1" style={styles.notAvailable}>
        <b>Names and Roles not available</b>
      </Typography>
    );*/

    return (
      <div>
        <div>
          <Typography variant="h4" gutterBottom>
            Microsoft Teams Simulator
          </Typography>
        </div>
        <div align={"center"} style={{margin: "auto", padding: 50, width: "80%"}}>
          <Paper style={{margin: "auto", padding:20}} elevation={2}>
            <img src={'https://github.com/OfficeDev/msteams-meetings-template/blob/master/doc/Splash.gif?raw=true'} alt={"teams"} width={"80%"} height={"auto"}/>
          </Paper>
        </div>
        <div>
          <Typography variant="h5" gutterBottom>
            Welcome, {this.state.user} ({this.state.userEmail})!<br/>
            To work properly, Microsoft will need the following:<br/>
            Course Name: {this.state.course} <br/>
            Course Role: {this.state.userRole} <br/>
            Course UUID: {this.state.courseUuid}<br/>
            Course ID: {this.state.learnCourseId}<br/><br/>
            For testing purposes, the version of Learn being used is {this.state.learnVersion}<br/>
          </Typography>
          <br/>
          {/*{namesRoles}*/}
          <br/>
          <Grid
            container
            direction={"column"}
            spacing={8}>
            <Grid item xs>
              <Button
                id={"return_button"}
                variant="contained"
                color="secondary"
                href={this.state.returnUrl}>
                Return to Learn
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                id={"return_with_msg_button"}
                variant={"contained"}
                color={"secondary"}
                href={msgReturn}>
                Return with Message
              </Button>
            </Grid>
            <Grid item xs>
              <Button
                id={"return_with_error_button"}
                variant={"contained"}
                color={"secondary"}
                href={errorReturn}>
                Return with Error
              </Button>
            </Grid>
          </Grid>
          <br/>
          <Grid item xs>
            <JSONInput
              id='jwt_body'
              viewOnly={true}
              confirmGood={false}
              placeholder={this.state.nrBody}
              theme={"dark_vscode_tribute"}
              style={{body: styles.jsonEditor}}
              locale={locale}
              height="100%"
              width={"100%"}
            />
          </Grid>
          <br/>
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
            </Typography> }
        </div>
      </div>
    );
  }
}

export default MsTeamsView;
