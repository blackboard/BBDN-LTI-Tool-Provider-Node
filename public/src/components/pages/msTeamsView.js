import Button from '@material-ui/core/Button';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';
import ExpansionPanel from '@material-ui/core/ExpansionPanel';
import ExpansionPanelDetails from '@material-ui/core/ExpansionPanelDetails';
import ExpansionPanelSummary from '@material-ui/core/ExpansionPanelSummary';
import Grid from '@material-ui/core/Grid';
import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import locale from 'react-json-editor-ajrm/locale/en';
import parameters from '../../util/parameters';
import { styles } from '../../common/styles/custom.js';

const params = parameters.getInstance();

const claimContext = 'https://purl.imsglobal.org/spec/lti/claim/context';
const claimToolPlatform = 'https://purl.imsglobal.org/spec/lti/claim/tool_platform';
const claimRoles = 'https://purl.imsglobal.org/spec/lti/claim/roles';

export default class MsTeamsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch(`jwtPayloadData?nonce=${params.getNonce()}`)
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
      '&lti_msg=' +
      encodeURI('I have a message for you') +
      '&lti_log=' +
      encodeURI('Log this message');

    const errorReturn =
      this.state.errorUrl +
      '&lti_errormsg=' +
      encodeURI('An error has occurred') +
      '&lti_errorlog=' +
      encodeURI('Log this error');

    // switch this to use whatever we're going to use in the end via microservice
    const namesRoles = this.state.namesRoles ? (
      <Grid item xs>
        <Typography variant={'h6'} gutterBottom>
          Click this button to view all users in the course and their roles
        </Typography>
        <form action="/namesAndRoles" method="POST">
          <Button variant="contained" type={'submit'} color={'secondary'}>Names and Roles</Button>
          <input type="hidden" name="body" value={JSON.stringify(this.state.body)}/>
        </form>
      </Grid>
    ) : (
      <Grid item xs>
        <Typography variant="body1" style={styles.notAvailable}>
          <b>Names and Roles not available</b>
        </Typography>
      </Grid>
    );

    const learnOptions = (
      <Grid item xs>
        <Grid item xs>
          <Typography variant={'h6'} gutterBottom>
            Click any of these buttons to return to Learn
          </Typography>
        </Grid>
        <Grid item xs>
          <Button
            id={'return_button'}
            variant="contained"
            color="secondary"
            href={this.state.returnUrl}>
            Return to Learn
          </Button>
        </Grid><br/>
        <Grid item xs>
      <Button
        id={'return_with_msg_button'}
        variant={'contained'}
        color={'secondary'}
        href={msgReturn}>
        Return with Message
      </Button>
    </Grid><br/>
        <Grid item xs>
      <Button
        id={'return_with_error_button'}
        variant={'contained'}
        color={'secondary'}
        href={errorReturn}>
        Return with Error
      </Button>
    </Grid><br/>
      </Grid>
    );

    return (
      <div>
        <div>
          <Typography variant="h4" gutterBottom>
            Microsoft Teams Simulator
          </Typography>
        </div>
        <div>
          <Typography variant="h5">
            Welcome, {this.state.user} ({this.state.userEmail})!<br/>
            To work properly, Microsoft will need the following:<br/>
            Course Name: {this.state.course} <br/>
            Course Role: {this.state.userRole} <br/>
            Course UUID: {this.state.courseUuid}<br/>
            Course ID: {this.state.learnCourseId}<br/>
            For testing purposes, the version of Learn being used is {this.state.learnVersion}<br/>
          </Typography>
          <br/>
          <Grid
            container
            direction={'column'}
            spacing={3}>
            {namesRoles}
            {learnOptions}
          </Grid>
          {verified ?
            <ExpansionPanel>
              <ExpansionPanelSummary expandIcon={<ExpandMoreIcon/>}>
                <Typography variant="body1">
                  <b>JWT Body</b>
                </Typography>
              </ExpansionPanelSummary>
              <ExpansionPanelDetails>
                <JSONInput
                  id="jwt_body"
                  viewOnly={true}
                  confirmGood={false}
                  placeholder={this.state.body}
                  theme={'dark_vscode_tribute'}
                  style={{ body: styles.jsonEditor }}
                  locale={locale}
                  height="100%"
                  width={'100%'}
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
