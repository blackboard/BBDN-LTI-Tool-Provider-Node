import React from 'react';

class DeepLinkOptions extends React.Component {
  render() {
    return(
      <div>
        <div><h3>Deep Linking Payload Options</h3></div>

        <div>
          <form action="deepLinkContent" method="POST">
            <table>
              <tbody>
              <tr><td>&nbsp;</td><td><h5>Deep Linking Payloads</h5></td></tr>
              <tr><td><input type="radio" name="custom_option" value="1" /></td><td>LTI Link</td></tr>
              <tr><td><input type="radio" name="custom_option" value="2" /></td><td>Content Link</td></tr>
              <tr><td><input type="radio" name="custom_option" value="3" /></td><td>File</td></tr>
              <tr><td><input type="radio" name="custom_option" value="4" /></td><td>HTML</td></tr>
              <tr><td><input type="radio" name="custom_option" value="5" /></td><td>Image</td></tr>
              <tr><td><input type="radio" name="custom_option" value="9" /></td><td>Build-a-Payload<br/><br/>
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
              <tr><td><input type="radio" name="custom_option" value="0" /></td><td>6) Enter JSON<br/><textarea rows="4" cols="50" name="custom_content" /></td></tr>
              </tbody>
            </table>
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    )
  }
}

module.exports = DeepLinkOptions;