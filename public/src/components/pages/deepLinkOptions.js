import React from "react";
import {Table, TableBody, TableCell, TableHead, TableRow, Typography, withStyles} from "@material-ui/core";

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

class DeepLinkOptions extends React.Component {
  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Deep Linking Payload Options
        </Typography>

        <div>
          <form action="deepLinkContent" method="POST">

            <Table style={{width: "45%"}}>
              <TableBody>
                <TableRow>
                  <TableCell colSpan={2}>
                    <Typography variant="h5">
                      Deep Linking Payloads
                    </Typography>
                  </TableCell>
                </TableRow>
                <TableRow>
                  <CustomTableCell>
                    <input type="radio" name="custom_option" value="1" defaultChecked="true"/>
                  </CustomTableCell>
                  <CustomTableCell>
                    <Typography variant="h6">
                      Build-A-Payload
                    </Typography>
                    <Table>
                      <TableBody>
                        <TableRow>
                          <CustomTableCell>LTI Links:</CustomTableCell>
                          <CustomTableCell>
                            <input type="text" size="2" name="custom_ltilinks" defaultValue="1"/>
                          </CustomTableCell>
                        </TableRow>
                        <TableRow>
                          <CustomTableCell>Embedded LTI Links:</CustomTableCell>
                          <CustomTableCell>
                            <input type="text" size="2" name="embed_ltilinks"/>
                          </CustomTableCell>
                        </TableRow>
                        <TableRow>
                          <CustomTableCell>Content Links:</CustomTableCell>
                          <CustomTableCell>
                            <input type="text" size="2" name="custom_contentlinks"/>
                          </CustomTableCell>
                        </TableRow>
                        <TableRow>
                          <CustomTableCell>Files:</CustomTableCell>
                          <CustomTableCell>
                            <input type="text" size="2" name="custom_files"/>
                          </CustomTableCell>
                        </TableRow>
                        <TableRow>
                          <CustomTableCell>HTMLs:</CustomTableCell>
                          <CustomTableCell>
                            <input type="text" size="2" name="custom_htmls"/>
                          </CustomTableCell>
                        </TableRow>
                        <TableRow>
                          <CustomTableCell>Images:</CustomTableCell>
                          <CustomTableCell>
                            <input type="text" size="2" name="custom_images"/>
                          </CustomTableCell>
                        </TableRow>
                      </TableBody>
                    </Table>
                  </CustomTableCell>
                </TableRow>
                <TableRow>
                  <CustomTableCell>
                    <input type="radio" name="custom_option" value="2"/>
                  </CustomTableCell>
                  <CustomTableCell>
                    <Typography variant="h6">
                      Enter JSON
                    </Typography>
                    <textarea rows="8" cols="65" name="custom_content"/>
                  </CustomTableCell>
                </TableRow>
              </TableBody>
            </Table>

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

            <input type="submit" value="Submit"/>
          </form>
        </div>
      </div>
    );
  }
}

export default DeepLinkOptions;
