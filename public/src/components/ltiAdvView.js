import React from "react";
import JSONTree from 'react-json-tree';

class LtiAdvView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      body: {}
    };
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
          namesRoles: jwtPayload.namesRoles,
          grading: jwtPayload.grading
        });
      });
  }

  render() {
    let body = JSON.stringify(this.state.body);
    const verified = (this.state.verified) ? <span className="verified">Verified</span> : <span className="notverified">Verify failed</span>;
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
          <p>
            What would you like to do?<br/>
            <form action={this.state.returnUrl} method="post"><input type="submit" value="Return to Learn" /></form>
            <form action={msgReturn} method="post"><input type="submit" value="Return with message" /></form>
            <form action={errorReturn} method="post"><input type="submit" value="Return with error" /></form>
            {namesRoles}
            {grading}
          </p>
          <p>{verified}</p>
          <p>
            <b>JWT Header</b>
            <JSONTree data={this.state.header} hideRoot={true} />
          </p>
          <p>
            <b>JWT Body</b>
            <JSONTree data={this.state.body}  hideRoot={true} />
          </p>
        </div>
      </div>
    )
  }
}

module.exports = LtiAdvView;
