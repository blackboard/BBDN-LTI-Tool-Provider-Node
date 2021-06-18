import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import Typography from '@material-ui/core/Typography';
import locale from 'react-json-editor-ajrm/locale/en';
import { Table, TableBody, TableCell, TableHead, TableRow } from '@material-ui/core';
import { styles } from '../../common/styles/custom.js';
import { withStyles } from '@material-ui/core/styles';
import parameters from "../../util/parameters";

const params = parameters.getInstance();

const CustomTableCell = withStyles(theme => ( {
  head: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4
  },
  body: {
    fontSize: 14,
    padding: 4
  }
} ))(TableCell);

/**
 * We should see this view if one of the following has happened:
 * 1. An error occurred while student was taking assessment
 * 2. The attempt has been submitted and we specified end_assessment_return=true in LtiStartAssessment
 */
export default class ProctoringEndOptionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch(`getProctoringPayloadData?nonce=${params.getNonce()}`)
      .then(result => result.json())
      .then(proctoringServicePayload => {
        this.setState({
          header: proctoringServicePayload.header,
          body: proctoringServicePayload.body,
        });
      });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Proctoring End: Options
        </Typography>
        <br/>
        <div style={{ marginBottom: '30px' }}>
          <Typography variant="body1" gutterBottom>
            We have received your notification that the assessment has ended.
          </Typography>
          <Typography variant="body1">
            Any messages added here will be appended to the return URL.
          </Typography>
          <br/>
          <form action="buildProctoringEndReturnPayload" method="POST">
            <Typography variant="h5">Messages</Typography>
            <Table style={{ width: '45%' }}>
              <TableHead>
                <TableRow style={{ fontSize: '14px' }}>
                  <CustomTableCell>&nbsp;</CustomTableCell>
                  <CustomTableCell>Return messages</CustomTableCell>
                  <CustomTableCell align="center">Display</CustomTableCell>
                  <CustomTableCell align="center">Log</CustomTableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                <TableRow>
                  <CustomTableCell>Message</CustomTableCell>
                  <CustomTableCell><input type="text" size="50" name="custom_message"
                                          defaultValue="I have a message"/></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_message_msg"/></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_message_log"/></CustomTableCell>
                </TableRow>
                <TableRow>
                  <CustomTableCell>Error</CustomTableCell>
                  <CustomTableCell><input type="text" size="50" name="custom_error"
                                          defaultValue="I have an error"/></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_error_msg"/></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_error_log"/></CustomTableCell>
                </TableRow>
              </TableBody>
            </Table>
            <br/>
            <input type="submit" value="Build return URL"/>
          </form>
        </div>
        <Typography variant="h5" gutterBottom>
          Request JWT
        </Typography>
        <br/>
        <Typography variant="h6" gutterBottom>
          <b>JWT Header</b>
        </Typography>
        {this.state.header &&
        <JSONInput
          id="jwt_header"
          viewOnly={true}
          confirmGood={false}
          placeholder={this.state.header}
          theme="dark_vscode_tribute"
          locale={locale}
          height="100%"
          width="100%"
        />
        }
        <Typography variant="h6" gutterBottom>
          <b>JWT Body</b>
        </Typography>
        {this.state.body &&
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
        }
      </div>
    );
  }
}
