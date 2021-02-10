import React from "react";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";
import {Table, TableBody, TableCell, TableHead, TableRow, withStyles} from "@material-ui/core";
import locale from "react-json-editor-ajrm/locale/en";
import JSONInput from "react-json-editor-ajrm";

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

class ProctoringServiceOptionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("getProctoringServicePayloadData")
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
          Proctoring Options
        </Typography>
        <div>
          <Typography variant="body1" gutterBottom>
            We have received your proctoring service launch.
          </Typography>
          <Typography variant="body1">
            You can customize a return payload using the following options.
          </Typography>
          <br />
          <form action="buildProctoringServiceReturnPayload" method="POST">
            <Table style={{width: "45%"}}>
                <TableHead>
                  <TableRow style={{fontSize: "14px"}}>
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
              <br />
              <input type="submit" value="Build payload" />
          </form>
          <br />
          <Typography variant="h5">
            Request JWT
          </Typography>
          <br />
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

export default ProctoringServiceOptionsView;
