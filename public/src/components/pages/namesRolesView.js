import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import locale from 'react-json-editor-ajrm/locale/en';
import { Button, Grid, Typography } from '@material-ui/core';
import { styles } from '../../common/styles/custom.js';

export default class NamesRolesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch('nrPayloadData')
      .then(result => result.json())
      .then(nrPayload => {
        this.setState({
          url: nrPayload.url,
          body: nrPayload.body,
          differenceUrl: nrPayload.difference_url,
          nextUrl: nrPayload.next_url,
          origBody: nrPayload.orig_body,
          returnUrl: nrPayload.return_url
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);
    const diff =
      this.state.differenceUrl !== '' ? (
        <form action="/namesAndRoles2" method="POST">
          <Button type={'submit'} variant={'contained'} color={'secondary'}>NRPS Difference</Button>
          <input type="hidden" name="body" defaultValue={body}/>
          <input type="hidden" name="url" defaultValue={this.state.differenceUrl}/>
        </form>
      ) : (
        <Typography variant="body1" style={styles.notAvailable}>
          <b>No difference link</b>
        </Typography>
      );
    const next =
      this.state.nextUrl !== '' ? (
        <form action="/namesAndRoles2" method="POST">
          <Button type={'submit'} variant={'contained'} color={'secondary'}>NRPS Next</Button>
          <input type="hidden" name="body" defaultValue={body}/>
          <input type="hidden" name="url" defaultValue={this.state.nextUrl}/>
        </form>
      ) : (
        <Typography variant="body1" style={styles.notAvailable}>
          No next link
        </Typography>
      );

    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Names and Roles Service
        </Typography>

        <div>
          <Typography variant="h6" gutterBottom>
            What would you like to do?
          </Typography>
          <Grid
            container
            direction={'column'}
            spacing={2}>
            <Grid item xs>
              <form action={this.state.returnUrl} method="post">
                <Button type={'submit'} variant={'contained'} color={'secondary'}>Return to Learn</Button>
              </form>
            </Grid>
            <Grid item xs>
              <form action="/namesAndRoles" method="post">
                <Button type={'submit'} variant={'contained'} color={'secondary'}>Names and Roles</Button>
                <input type="hidden" name="body" defaultValue={body}/>
              </form>
            </Grid>
            <Grid item xs>
              {diff}
            </Grid>
            <Grid item xs>
              {next}
            </Grid>
          </Grid>

          <br/>
          <Typography variant="h5">
            Names and Roles Response
          </Typography>
          <JSONInput
            id="jwt_body"
            viewOnly={true}
            confirmGood={true}
            placeholder={this.state.body}
            theme={'dark_vscode_tribute'}
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height={'100%'}
            width={'100%'}
          />
        </div>
      </div>
    );
  }
}
