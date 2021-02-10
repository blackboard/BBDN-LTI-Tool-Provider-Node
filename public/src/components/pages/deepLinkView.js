import React from "react";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";
import JSONInput from "react-json-editor-ajrm";
import locale from "react-json-editor-ajrm/locale/en";

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
          <JSONInput
            id='jwt_return_json'
            viewOnly={true}
            confirmGood={false}
            placeholder={this.state.returnJSON}
            theme={"dark_vscode_tribute"}
            style={{body: styles.jsonEditor}}
            locale={locale}
            height="900px"
            width={"100%"}
          />

          <br />
          <Typography variant="h5">
            Deep Linking Request
          </Typography>
          {verified}

          <Typography variant="body1">
            <b>JWT Header</b>
          </Typography>
          <JSONInput
            id='jwt_header'
            viewOnly={true}
            confirmGood={false}
            placeholder={this.state.header}
            theme={"dark_vscode_tribute"}
            style={{body: styles.jsonEditor}}
            locale={locale}
            height="500px"
            width={"100%"}
          />
          <Typography variant="body1">
            <b>JWT Body</b>
          </Typography>
          <JSONInput
            id='jwt_body'
            viewOnly={true}
            confirmGood={false}
            placeholder={this.state.body}
            theme={"dark_vscode_tribute"}
            style={{body: styles.jsonEditor}}
            locale={locale}
            height="1500px"
            width={"100%"}
          />
        </div>
      </div>
    );
  }
}

export default DeepLinkPayloadView;
