import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";

class DeepLinkPayloadView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("dlPayloadData")
      .then(result => result.json())
      .then(dlPayload => {
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
    const verified = this.state.verified ? (
      <Typography variant="body1" style={styles.passed}>
        Verified
      </Typography>
    ) : (
      <Typography variant="body1" style={styles.failed}>
]        Verify failed
      </Typography>
    );

    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Deep Linking 2.0 Launch
        </Typography>

        <div>
          <Typography variant="body1" gutterBottom>
            We have received your Deep Linking launch. You can view the JSON below.
          </Typography>
          <form action={this.state.returnUrl} method="POST">
            <input type="hidden" name="JWT" defaultValue={this.state.jwt} />
            <input type="submit" value="Return Deep Linking" />
          </form>

          <Typography variant="body1">
            <b>Return JSON</b>
          </Typography>
          <JSONTree data={this.state.returnJSON} hideRoot={true} theme={styles.monokai} invertTheme={true} />

          <br />
          <Typography variant="h5">
            Deep Linking Request
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

export default DeepLinkPayloadView;
