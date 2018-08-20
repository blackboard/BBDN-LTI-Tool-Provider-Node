import React from 'react';

export const DeepLinkOptions = () =>(
  <div>
    <div><h3>Deep Linking Payload Options</h3></div>

    <div>
      <form action="deepLinkContent" method="POST">
        <table>
          <tbody>
          <tr><td>&nbsp;</td><td><h5>Deep Linking Payloads</h5></td></tr>
          <tr><td><input type="radio" name="custom_option" value="1" /></td><td>Build-A-Payload<br/><br/>
            <table>
              <tbody>
              <tr><td className="ci">LTI Links: </td><td className="ci"><input className="ci" type="text" size="2" name="custom_ltilinks" /></td></tr>
              <tr><td className="ci">Content Links: </td><td className="ci"><input className="ci" type="text" size="2" name="custom_contentlinks" /></td></tr>
              <tr><td className="ci">Files: </td><td className="ci"><input className="ci" type="text" size="2" name="custom_files" /></td></tr>
              <tr><td className="ci">HTMLs: </td><td className="ci"><input className="ci" type="text" size="2" name="custom_htmls" /></td></tr>
              <tr><td className="ci">Images: </td><td className="ci"><input className="ci" type="text" size="2" name="custom_images" /></td></tr>
              </tbody>
            </table>
            </td></tr>
          <tr><td><input type="radio" name="custom_option" value="2" /></td><td>Enter JSON<br/><br/><textarea rows="4" cols="50" name="custom_content" /></td></tr>
          </tbody>
        </table>
        <table>
          <tbody>
          <tr><td className="ci">&nbsp;</td><td className="ci"><h5>Return messages</h5></td><td className="ci">Display</td><td className="ci">Log</td></tr>
          <tr>
            <td className="ci">Message</td><td className="ci"><input className="ci" type="text" size="50" name="custom_message" defaultValue="I have a message" /></td>
            <td><input className="cl" type="checkbox" name="custom_message_msg" /></td>
            <td><input className="cl" type="checkbox" name="custom_message_log" /></td>
          </tr>
          <tr>
            <td className="ci">Error</td><td className="ci"><input className="ci" type="text" size="50" name="custom_error" defaultValue="I have an error" /></td>
            <td><input className="cl" type="checkbox" name="custom_error_msg" /></td>
            <td><input className="cl" type="checkbox" name="custom_error_log" /></td>
          </tr>
          </tbody>
        </table>
        <input type="submit" value="Submit" />
      </form>
    </div>
  </div>
);
