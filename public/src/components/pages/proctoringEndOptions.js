import React from "react";
import Typography from "@material-ui/core/Typography";
import JSONTree from "react-json-tree";
import {Table, TableBody, TableCell, TableHead, TableRow, withStyles} from "@material-ui/core";
import {styles} from "../../common/styles/custom.js";

const CustomTableCell = withStyles(theme => ({
  head: {
    fontSize: 16,
    fontWeight: "bold",
    padding: 4
  },
  body: {
    fontSize: 14,
    padding: 4
  }
}))(TableCell);

/**
 * We should see this view if one of the following has happened:
 * 1. An error occurred while student was taking assessment
 * 2. The attempt has been submitted and we specified end_assessment_return=true in LtiStartAssessment
 */
class ProctoringEndOptionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("getProctoringPayloadData")
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
          Proctoring End Options
        </Typography>
        <br />
        <div style={{ marginBottom: '30px' }}>
          <Typography variant="body1" gutterBottom>
            We have received your notification that the assessment has ended.
          </Typography>
          <Typography variant="body1">
            Any messages added here will be appended to the return URL.
          </Typography>
          <br />
          <form action="buildProctoringEndReturnPayload" method="POST">
            <Typography variant="h5">Messages</Typography>
            <Table style={{ width: "45%" }}>
              <TableHead>
                <TableRow style={{ fontSize: "14px" }}>
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
                    defaultValue="I have a message" /></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_message_msg" /></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_message_log" /></CustomTableCell>
                </TableRow>
                <TableRow>
                  <CustomTableCell>Error</CustomTableCell>
                  <CustomTableCell><input type="text" size="50" name="custom_error"
                    defaultValue="I have an error" /></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_error_msg" /></CustomTableCell>
                  <CustomTableCell align="center"><input type="checkbox" name="custom_error_log" /></CustomTableCell>
                </TableRow>
              </TableBody>
            </Table>
            <br />
            <input type="submit" value="Build return URL" />
          </form>
        </div>
        <Typography variant="h5">
          Request JWT
        </Typography>
        <br />
        <Typography variant="body1">
          <b>JWT Header</b>
        </Typography>
        {this.state.header &&
          <JSONTree data={this.state.header} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        }
        <Typography variant="body1">
          <b>JWT Body</b>
        </Typography>
        {this.state.body &&
          <JSONTree data={this.state.body} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        }
      </div>
    );
  }
}

export default ProctoringEndOptionsView;
