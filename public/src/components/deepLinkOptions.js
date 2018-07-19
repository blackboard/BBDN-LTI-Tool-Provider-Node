import React from "react";

class DeepLinkOptions extends React.Component {
  render() {
    return(
      <div>
        <div><h3>Deep Linking Payload Options</h3></div>

        <div>
          <form action="deepLinkContent" method="POST">
            <table>
              <tbody>
              <tr><td>&nbsp;</td><td>Deep Linking Payloads</td></tr>
              <tr><td><input type="radio" name="custom_option" value="1" /></td><td>1) 1 LTI Link</td></tr>
              <tr><td><input type="radio" name="custom_option" value="2" /></td><td>2) 1 Content Link</td></tr>
              <tr><td><input type="radio" name="custom_option" value="5" /></td><td>5) Build-a-Payload<br/>
                <table>
                  <tbody>
                  <tr><td className="ci">LTI Links: </td><td className="ci"><input className="ci" type="text" size="2" name="custom_ltilinks" /></td></tr>
                  <tr><td className="ci">Content Links: </td><td className="ci"><input className="ci" type="text" size="2" name="custom_contentlinks" /></td></tr>
                  </tbody>
                </table>
                </td></tr>
              <tr><td><input type="radio" name="custom_option" value="6" /></td><td>6) Enter JSON<br/><textarea rows="4" cols="50" name="custom_content" /></td></tr>
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