import React from "react";

class DeepLinkPayloadView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch('DLPayloadData')
      .then(result => result.json())
      .then((dlPayload) => {
        this.setState({
          header: dlPayload.header,
          body: dlPayload.body,
          returnUrl: dlPayload.return_url,
          verified: dlPayload.verified,
          jwt: dlPayload.jwt,
          returnJSON: dlPayload.return_json
        });
      });
  }

  render() {
    const header = JSON.stringify(this.state.header, null, '  ');
    const body = JSON.stringify(this.state.body, null, '  ');
    const returnJSON = JSON.stringify(this.state.returnJSON, null, '  ');
    const verified = (this.state.verified) ? <span className="verified">Verified</span> : <span className="notverified">Verify failed</span>;


    return(
      <div>
        <div><h3>Deep Linking 2.0 Launch</h3></div>

        <div>
          <p>We have received your Deep Linking launch. You can view the JSON below.</p>

          <p>
            <b>Return JSON</b>
            <pre>{returnJSON}</pre>
            <form action={this.state.returnUrl} method="POST">
              <input type="hidden" name="JWT" value={this.state.jwt}/>
              <input type="submit" value="Return Deep Linking" />
            </form>
          </p>
          <h4>Deep Linking Request</h4>
          <p>{verified}</p>
          <p>
            <b>JWT Header</b>
            <pre>{header}</pre>
          </p>
          <p>
            <b>JWT Body</b>
            <pre>{body}</pre>
          </p>
        </div>
      </div>
    )
  }
}

module.exports = DeepLinkPayloadView;
