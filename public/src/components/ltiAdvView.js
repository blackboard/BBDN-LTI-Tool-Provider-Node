import React from "react";
import JSONTree from 'react-json-tree';

class LtiAdvView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch('jwtPayloadData')
      .then(result => result.json())
      .then((jwtPayload) => {
        this.setState({
          header: jwtPayload.header,
          body: jwtPayload.body,
          returnUrl: jwtPayload.return_url,
          errorUrl: jwtPayload.error_url,
          verified: jwtPayload.verified,
          namesRoles: jwtPayload.names_roles,
          grading: jwtPayload.grading
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.body);
    const verified = (this.state.verified) ? <span className="verified">Verified<br/></span> : <span className="notverified">Verify failed<br/></span>;
    const msgReturn = this.state.returnUrl + "&lti_msg=" + encodeURI("I have a message for you") + "&lti_log=" + encodeURI("Log this message");
    const errorReturn = this.state.errorUrl + "&lti_errormsg=" + encodeURI("An error has occurred") + "&lti_errorlog=" + encodeURI("Log this error");
    const namesRoles = (this.state.namesRoles) ? <form action="/namesAndRoles" method="POST"><input type="submit" value="Names and Roles" /><input type="hidden" name="body" value={body} /></form> :
      <div><b>Names and Roles not available</b></div>;
    const grading = (this.state.grading) ? <form action="/assignAndGrades" method="POST"><input type="submit" value="submit" value="Assignments and Grades" /><input type="hidden" name="body" value={body} /></form> :
      <div><b>Assignments and Grades not available</b></div>;

    return(
      <div>
        <div><h3>LTI Advantage Launch</h3></div>

        <div>
          <p>We have received your LTI launch. You can view the JSON below.</p>
          <span>What would you like to do?</span>
          <form action={this.state.returnUrl} method="post"><input type="submit" value="Return to Learn" /></form>
          <form action={msgReturn} method="post"><input type="submit" value="Return with message" /></form>
          <form action={errorReturn} method="post"><input type="submit" value="Return with error" /></form>
          {namesRoles}
          {grading}

          <br/>
          <h4>Resource Launch</h4>
          {verified}

          <b>JWT Header</b>
          <JSONTree data={this.state.header} hideRoot={true} />

          <b>JWT Body</b>
          <JSONTree data={this.state.body}  hideRoot={true} />
        </div>
      </div>
    )
  }
}

module.exports = LtiAdvView;
