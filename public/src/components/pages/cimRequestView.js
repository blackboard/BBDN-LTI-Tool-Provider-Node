import React from "react";

class CIMRequestView extends React.Component {
  render() {
    return (
      <div>
        <div className="row">
          <div className="large-6 column">
            <h2>Select CIM to return</h2>
          </div>
        </div>

        <div>
          <form action="/CIMRequest" method="post">
            <table>
              <tbody>
                <tr>
                  <td>&nbsp;</td>
                  <td>CIM options</td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="custom_option" value="1" />
                  </td>
                  <td>1) 2 LtiLinkItems 2 ContentItem</td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="custom_option" value="2" />
                  </td>
                  <td>2) 1 LtiLinkItem</td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="custom_option" value="3" />
                  </td>
                  <td>3) 1 ContentItem</td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="custom_option" value="4" />
                  </td>
                  <td>4) 1 ContentItem w/ long text</td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="custom_option" value="5" />
                  </td>
                  <td>5) Option 1 x 3</td>
                </tr>
                <tr>
                  <td>
                    <input type="radio" name="custom_option" value="6" />
                  </td>
                  <td>
                    6) Enter JSON
                    <br />
                    <textarea rows="4" cols="50" name="custom_content" />
                  </td>
                </tr>
              </tbody>
            </table>
            <input type="submit" value="Submit" />
          </form>
        </div>
      </div>
    );
  }
}

export default CIMRequestView;
