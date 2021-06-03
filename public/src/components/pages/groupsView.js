import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import locale from 'react-json-editor-ajrm/locale/en';
import { Button, Grid, TextField } from '@material-ui/core';
import { styles } from '../../common/styles/custom.js';

export default class GroupsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch('groupsPayloadData')
      .then(result => result.json())
      .then(groupsPayload => {
        this.setState({
          url: groupsPayload.url,
          body: groupsPayload.body,
          nextUrl: groupsPayload.next_url,
          origBody: groupsPayload.orig_body,
          returnUrl: groupsPayload.return_url
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);
    const next =
      this.state.nextUrl !== '' ? (
        <form action="/getgroups" method="POST">
          <Button type={'submit'} variant={'contained'} color={'secondary'}>Groups Next</Button>
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
          Groups Service
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
              <form action="/getgroups" method="post">
                <table>
                  <tbody>
                  <tr>
                    <td>
                      <Button type={'submit'} variant={'contained'} color={'secondary'}>Groups</Button>
                      <input type="hidden" name="body" defaultValue={body}/>
                      <input type="hidden" name="url" defaultValue={this.state.url}/>
                    </td>
                    <td>
                      <TextField
                        variant={'outlined'}
                        name={'userid'}
                        placeholder={'User UUID'}
                      />
                    </td>
                  </tr>
                  </tbody>
                </table>
              </form>
            </Grid>
            <Grid item xs>
              {next}
            </Grid>
          </Grid>

          <br/>
          <Typography variant="h5">
            Groups Response
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
