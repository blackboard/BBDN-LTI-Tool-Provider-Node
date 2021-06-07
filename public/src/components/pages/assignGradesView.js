import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import locale from 'react-json-editor-ajrm/locale/en';
import { Button, Grid, TextField } from '@material-ui/core';
import { styles } from '../../common/styles/custom.js';

class AssignGradesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch('agPayloadData')
      .then(result => result.json())
      .then(agPayload => {
        this.setState({
          origBody: agPayload.orig_body,
          claim: agPayload.claim,
          lineItems: agPayload.lineItems,
          lineItem: agPayload.lineItem,
          body: agPayload.body,
          lineItemScope: agPayload.scopeLineItem,
          readScope: agPayload.scopeLineItemReadonly,
          scoreScope: agPayload.scopeScore,
          resultsScope: agPayload.scopeResult
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);

    const readAllCols =
      this.state.lineItemScope ? (
        <form action="/agsReadCols" method="post">
          <Button type={'submit'} variant={'contained'} color={'secondary'}>Read Columns</Button>
          <input type="hidden" name="body" defaultValue={body}/>
          <input type="hidden" name="url" defaultValue={this.state.lineItems}/>
        </form>
      ) : (
        <Typography variant="subtitle1" style={styles.notAvailable}>
          <b>Read Column not available</b>
        </Typography>
      );

    const addNewCol =
      this.state.lineItemScope ? (
        <form action="/agsAddCol" method="post">
          <table>
            <tbody>
            <tr>
              <td>
                <Button type={'submit'} variant={'contained'} color={'secondary'}>Add/Update Column</Button>
                <input type="hidden" name="body" defaultValue={body}/>
                <input
                  type="hidden"
                  name="url"
                  defaultValue={this.state.lineItems}
                />
              </td>
              <td>
                <TextField
                  variant={'outlined'}
                  name={'score'}
                  label={'Score'}
                  size={'small'}/>
              </td>
              <td>
                <TextField
                  variant={'outlined'}
                  name={'label'}
                  label={'Column Name'}
                  size={'small'}/>
              </td>
              <td>
                <TextField
                  variant={'outlined'}
                  name={'columnId'}
                  label={'Column ID'}
                  size={'small'}/>
              </td>
              <td>
                <TextField
                  variant={'outlined'}
                  name={'dueDate'}
                  label={'Due Date'}
                  size={'small'}/>
              </td>
            </tr>
            </tbody>
          </table>
        </form>
      ) : (
        <Typography variant="subtitle1" style={styles.notAvailable}>
          <b>Add New Column not available</b>
        </Typography>
      );

    const delcol =
      !this.state.readScope ? (
        <form action="/agsDeleteCol" method="post">
          <table>
            <tbody>
            <tr>
              <td>
                <Button type={'submit'} variant={'contained'} color={'secondary'}>Delete Column</Button>
                <input type="hidden" name="body" defaultValue={body}/>
                <input type="hidden" name="url" defaultValue={this.state.lineItem}/>
                <input type="hidden" name="itemsUrl" defaultValue={this.state.lineItems}/>
              </td>
              <td>
                <TextField variant={'outlined'} name={'columnId'} label={'Column Id'} size={'small'}/>
              </td>
            </tr>
            </tbody>
          </table>
        </form>
      ) : (
        <Typography variant="subtitle1" style={styles.notAvailable}>
          <b>Delete Column not available</b>
        </Typography>
      );

    const results =
      this.state.resultsScope ? (
        <form action="/agsResults" method="post">
          <Button type={'submit'} variant={'contained'} color={'secondary'}>Read Results</Button>
          <input type="hidden" name="body" defaultValue={body}/>
          <input type="hidden" name="url" defaultValue={this.state.lineItem}/>
        </form>
      ) : (
        <Typography variant="subtitle1" style={styles.notAvailable}>
          <b>Results not available</b>
        </Typography>
      );

    const scores =
      this.state.scoreScope ? (
        <form action="/agsScores" method="post">
          <table>
            <tbody>
            <tr>
              <td>
                <Button type={'submit'} variant={'contained'} color={'secondary'}>Send Scores</Button>
                <input type="hidden" name="body" defaultValue={body}/>
                <input type="hidden" name="url" defaultValue={this.state.lineItem}/>
                <input type="hidden" name="itemsUrl" defaultValue={this.state.lineItems}/>
              </td>
              <td>
                <TextField variant={'outlined'} name={'userid'} label={'User UUID'} size={'small'}/>
              </td>
              <td>
                <TextField variant={'outlined'} name={'score'} label={'Score'} size={'small'}/>
              </td>
              <td>
                <TextField variant={'outlined'} name={'column'} label={'Column ID'} size={'small'}/>
              </td>
            </tr>
            </tbody>
          </table>
        </form>
      ) : (
        <Typography variant="subtitle1" style={styles.notAvailable}>
          <b>Scores not available</b>
        </Typography>
      );

    const submitAttempt =
      this.state.lineItemScope ? (
        <form action="/agsSubmitAttempt" method="post">
          <table>
            <tbody>
            <tr>
              <td>
                <Button type={'submit'} variant={'contained'} color={'secondary'}>Submit Attempt</Button>
                <input type="hidden" name="body" defaultValue={body}/>
                <input type="hidden" name="url" defaultValue={this.state.lineItem}/>
              </td>
              <td>
                <TextField variant={'outlined'} name={'userid'} label={'User UUID'} size={'small'}/>
              </td>
            </tr>
            </tbody>
          </table>
        </form>
      ) : (
        <Typography variant="subtitle1" style={styles.notAvailable}>
          <b>Scores not available</b>
        </Typography>
      );

    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Assignment and Grade Service
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
              {readAllCols}
            </Grid>
            <Grid item xs>
              {addNewCol}
            </Grid>
            <Grid item xs>
              {delcol}
            </Grid>
            <Grid item xs>
              {results}
            </Grid>
            <Grid item xs>
              {scores}
            </Grid>
            <Grid item xs>
              {submitAttempt}
            </Grid>
          </Grid>

          <br/>
          <Typography variant="h5" gutterBottom>
            Assignment and Grades Response
          </Typography>

          <Typography variant="h6" gutterBottom>
            <b>Claims</b>
          </Typography>
          <JSONInput
            id="claim"
            viewOnly={true}
            confirmGood={false}
            placeholder={this.state.claim}
            theme="dark_vscode_tribute"
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height="100%"
            width="max-content"
          />

          <Typography variant="h6" gutterBottom>
            <b>Response</b>
          </Typography>
          <JSONInput
            id="jwt_body"
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

export default AssignGradesView;
