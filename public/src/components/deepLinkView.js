import React from 'react';
import JSONTree from 'react-json-tree';

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
          errorUrl: dlPayload.error_url,
          verified: dlPayload.verified,
          jwt: dlPayload.jwt,
          returnJSON: dlPayload.return_json
        });
      });
  }

  render() {
    const verified = (this.state.verified) ? <span className="verified">Verified</span> : <span className="notverified">Verify failed</span>;

    return(
      <div>
        <div><h3>Deep Linking 2.0 Launch</h3></div>

        <div>
          <p>We have received your Deep Linking launch. You can view the JSON below.</p>

          <form action={this.state.returnUrl} method="POST">
            <input type="hidden" name="id_token" value={this.state.jwt}/>
            <input type="submit" value="Return Deep Linking" />
          </form>
          <p>
            <b>Return JSON</b>
            <JSONTree data={this.state.returnJSON} hideRoot={true} />
          </p>
          <h4>Deep Linking Request</h4>
          <p>{verified}</p>
          <p>
            <b>JWT Header</b>
            <JSONTree data={this.state.header} hideRoot={true} />
          </p>
          <p>
            <b>JWT Body</b>
            <JSONTree data={this.state.body} hideRoot={true} />
          </p>
        </div>
      </div>
    )
  }
}

module.exports = DeepLinkPayloadView;
