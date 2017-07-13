import React, {Component} from 'react'
import JSONTree from 'react-json-tree'
class LogItemList extends React.Component {


  render() {
    const items = this.props.logItems;
    const listItems = items.map((item) =>
      <li>{item.message}
        <JSONTree data={item.data} hideRoot={true}/></li>
    );
    return (
      <ul>{listItems}</ul>
    );
  }
}

class Registration extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      logItems: []
    };
  }


  componentDidMount() {
    fetch('registrationactivity')
      .then(result => result.json())
      .then((registrationData: RegistrationData) => {
        let launch_return_url = registrationData ? registrationData.TCProfileResponse.launch_presentation_return_url : 'unknown';

        this.setState({
          status: registrationData.status,
          failReason: registrationData.failReason,
          logItems: registrationData.log,
          returnUrl: launch_return_url + '&status=' + registrationData.status + '&tool_proxy_guid=' + registrationData.tool_guid,
          failUrl: launch_return_url + '&status=failuree&lti_errormsg=Oops'
        });
        console.log(registrationData);

      })
  }


  render() {
    return (
      <div>
        <div className="row">
          <div className="large-6 columns"><h2>LTI 2.0 Demo Tool Provider</h2></div>
        </div>

        <div className="row">
          <div className="large-2 columns">Activity</div>
          <div className="large-10 columns">
            <LogItemList logItems={this.state.logItems}/>

          </div>
        </div>

        <div className="row">
          <div className="large-2 columns">Status</div>
          <div className="large-10 columns">{this.state.status}:{this.state.failReason}</div>
        </div>


        <form action="{this.state.returnUrl}">
          <div className="row">
            <div className="large-2 columns">
              <button className="btn btn-primary">Go Back using</button>
            </div>
            <div className="large-10 columns">
              <div><a href={this.state.returnUrl}>{this.state.returnUrl}</a></div>
              <br/>
              Failure link for testing<br/>
              <div><a href={this.state.failUrl}>{this.state.failUrl}</a></div>
            </div>
          </div>
        </form>
      </div>

    )
  }
}

module.exports = Registration;