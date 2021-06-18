import Button from '@material-ui/core/Button';
import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import locale from 'react-json-editor-ajrm/locale/en';
import { styles } from '../../common/styles/custom.js';

import parameters from '../../util/parameters';

const params = parameters.getInstance();

export default class DeepLinkPayloadView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch(`dlPayloadData?nonce=${params.getNonce()}`)
      .then(result => result.json())
      .then(dlPayload => {
        this.setState({
          header: dlPayload.jwt.header,
          body: dlPayload.jwt.body,
          returnUrl: dlPayload.jwt.return_url,
          errorUrl: dlPayload.jwt.error_url,
          verified: dlPayload.jwt.verified,
          jwt: dlPayload.jwt.jwt,
          returnJSON: dlPayload.jwt.return_json
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
        Verify failed
      </Typography>
    );

    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Deep Linking Launch
        </Typography>

        <div>
          <Typography variant="h6" gutterBottom>
            We have received your Deep Linking launch. You can view the JSON below.
          </Typography>
          <form action={this.state.returnUrl} method="POST" style={{"padding": "20px"}}>
            <input type="hidden" name="JWT" defaultValue={this.state.jwt} />
            <Button
              type="submit"
              value="Return Deep Linking"
              variant={"contained"}
              color={"secondary"}>Return Deep Linking
            </Button>
          </form>

          <Typography variant="h6" gutterBottom>
            <b>Return JSON</b>
          </Typography>
          <JSONInput
            id='jwt_return_json'
            viewOnly={true}
            confirmGood={true}
            placeholder={this.state.returnJSON}
            theme="dark_vscode_tribute"
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height="100%"
            width="100%"
          />

          <br />
          <Typography variant="h5">
            Deep Linking Request
          </Typography>
          {verified}

          <Typography variant="h6" gutterBottom>
            <b>JWT Header</b>
          </Typography>
          <JSONInput
            id='jwt_header'
            viewOnly={true}
            confirmGood={false}
            placeholder={this.state.header}
            theme="dark_vscode_tribute"
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height="100%"
            width="100%"
          />
          <Typography variant="h6" gutterBottom>
            <b>JWT Body</b>
          </Typography>
          <JSONInput
            id='jwt_body'
            viewOnly={true}
            confirmGood={true}
            placeholder={this.state.body}
            theme="dark_vscode_tribute"
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height="100%"
            width="100%"
          />
        </div>
      </div>
    );
  }
}
