import React from "react";

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
          verified: jwtPayload.verified
        });
      });
  }

  render() {
    const header = JSON.stringify( this.state.header, null, '  ' );
    const body = JSON.stringify( this.state.body, null, '  ' );
    const verified = (this.state.verified) ? <span className="verified">Verified</span> : <span className="notverified">Verify failed</span>;
    const msgReturn = this.state.returnUrl + "&lti_msg=" + encodeURI("I have a message for you");
    const errorReturn = this.state.returnUrl + "&lti_errormsg=" + encodeURI("An error has occurred");

    return (
      <div>
        <div className="row">
          <div className="large-6 columns"><h2>LTI 1.3 Payload</h2></div>
        </div>

        <div>
          <a href={this.state.returnUrl}><button>Return<br/>&nbsp;</button></a>&nbsp;&nbsp;
          <a href={errorReturn}><button>Error<br/>return</button></a>&nbsp;&nbsp;
          <a href={msgReturn}><button>Message<br/>return</button></a><br/>
          {verified}<br/>
          <b>JWT Header</b>
          <pre>{header}</pre>
          <b>JWT Body</b>
          <pre>{body}</pre>
        </div>
      </div>
    )
  }
}

module.exports = LTI13PayloadView;