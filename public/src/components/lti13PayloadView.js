import React from "react";
import JSONTree from 'react-json-tree';

class LTI13PayloadView extends React.Component {
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
          verified: jwtPayload.verified
        });
      });
  }

  render() {
    const verified = (this.state.verified) ? <span className="verified">Verified</span> : <span className="notverified">Verify failed</span>;
    const msgReturn = this.state.returnUrl + "&lti_msg=" + encodeURI("I have a message for you");
    const errorReturn = this.state.errorUrl + "&lti_errormsg=" + encodeURI("An error has occurred");

    return(
      <div>
        <div><h3>LTI 1.3 Launch</h3></div>

        <div>
          <p>We have received your LTI launch. You can view the JSON below.</p>
          <p>
            What would you like to do?<br/>
            <form action="getNamesAndRoles" method="post"><input type="submit" value="Names and Roles" /></form>
            <form action={this.state.returnUrl} method="post"><input type="submit" value="Return to Learn" /></form>
            <form action={msgReturn} method="post"><input type="submit" value="Return with message" /></form>
            <form action={errorReturn} method="post"><input type="submit" value="Return with error" /></form>
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

module.exports = LTI13PayloadView;