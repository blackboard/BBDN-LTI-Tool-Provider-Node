import Button from '@material-ui/core/Button';
import Grid from '@material-ui/core/Grid';
import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import locale from 'react-json-editor-ajrm/locale/en';
import { styles } from '../../common/styles/custom.js';

export default class GroupSetsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("groupSetsPayloadData")
      .then(result => result.json())
      .then(groupSetsPayload => {
        this.setState({
          url: groupSetsPayload.url,
          body: groupSetsPayload.body,
          nextUrl: groupSetsPayload.next_url,
          origBody: groupSetsPayload.orig_body,
          returnUrl: groupSetsPayload.return_url
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);
    const next =
      this.state.nextUrl !== "" ? (
        <form action="/groupsets" method="POST">
          <Button type="submit" variant="contained" color="secondary">Group Sets Next</Button>
          <input type="hidden" name="body" defaultValue={body} />
          <input type="hidden" name="url" defaultValue={this.state.nextUrl} />
        </form>
      ) : (
        <Typography variant="body1" style={styles.notAvailable}>
          No next link
        </Typography>
      );

    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Groups Service
        </Typography>

        <div>
          <Typography variant="h6" gutterBottom>
            What would you like to do?
          </Typography>
          <Grid
            container
            spacing={2}
            direction="column"
          >
            <Grid item xs>
              <form action={this.state.returnUrl} method="post">
                <Button type="submit" variant="contained" color="secondary">Return to Learn</Button>
              </form>
            </Grid>
            <Grid item xs>
              <form action="/groupsets" method="post">
                <Button type="submit" variant="contained" color="secondary">Group Sets</Button>
                <input type="hidden" name="body" defaultValue={body} />
              </form>
            </Grid>
            <Grid item xs>
              {next}
            </Grid>
          </Grid>

          <br />
          <Typography variant="h5">
            Group Sets Response
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
