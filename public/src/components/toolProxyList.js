import React from "react";
import {DropdownButton, MenuItem} from 'react-bootstrap';


class ToolProxyList extends React.Component {

  constructor(props) {
    super(props);
    this.state = {toolproxies: [], selected: ''};
  }

  onSelectToolProxy(selected) {
    let toolProxy = this.state.toolproxies.find(tp => tp.tool_proxy_guid == selected);
    this.setState({
      selected: toolProxy,
      selectedName: this.getToolProxyName(toolProxy)
    });
    this.props.onSelect(toolProxy);
  }

  getToolProxyName(toolProxy) {
    return toolProxy ? toolProxy.tool_proxy_guid + ':' + toolProxy.tool_profile.product_instance.product_info.product_name.default_value : 'No Tools Registered';
  }

  componentDidMount() {
    fetch('toolproxy')
      .then(result => result.json())
      .then((toolproxies) => {
        let selectedTP = toolproxies.length > 0 ? toolproxies[0] : null;
        this.setState({
          toolproxies: toolproxies,
          selected: selectedTP ? selectedTP : null,
          selectedName: this.getToolProxyName(selectedTP)
        });
        this.props.onSelect(selectedTP);
      })
  }

  render() {
    const menuItems = this.state.toolproxies.map((item) =>
      <MenuItem active={item.tool_proxy_guid === this.state.selected.tool_proxy_guid}
                eventKey={item.tool_proxy_guid}
                key={item.tool_proxy_guid}>
        {item.tool_proxy_guid}:{item.tool_profile.product_instance.product_info.product_name.default_value}
      </MenuItem>
    );

    return (
      <div>

        <table>
          <tbody>
          <tr>
            <td >Selected Tool Proxy</td>
            <td><DropdownButton
              onSelect={(selected)=>this.onSelectToolProxy(selected)}
              title={this.state.selectedName}
              id="tpldd">{menuItems}</DropdownButton>
            </td>
          </tr>
          </tbody>
        </table>

      </div>
    );
  }
}


module.exports = ToolProxyList;


// WEBPACK FOOTER //
// ./public/src/components/toolProxyList.js