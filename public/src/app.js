import $ from "jquery"
window.$ = $;
window.jQuery = $;
import React from 'react';
import {render} from 'react-dom';
import {Router, Route, Link, browserHistory} from 'react-router';
import Registration from './components/registration';
import LaunchEndpoint from './components/launchEndpoint';
import ProviderTools from './components/providerTools';
import ContentItemView from './components/contentItemView';
import CIMRequestView from './components/cimRequestView';
import LTI13PayloadView from './components/lti13PayloadView';
import SetupView from './components/setupView';
import DeepLinkView from './components/deepLinkView';
import DeepLinkOptions from './components/deepLinkOptions';

const None = React.createClass({
  render() {
    return (
      <div>
        <h1>None</h1>
      </div>
    )
  }
});

render((
  <Router history={browserHistory}>
    <Route path="/" component={ProviderTools}/>
    <Route path="/tp_registration" component={Registration}/>
    <Route path="/provider_tools" component={ProviderTools}/>
    <Route path="/ltilaunchendpoint" component={LaunchEndpoint}/>
    <Route path="/content_item" component={ContentItemView}/>
    <Route path="/cim_request" component={CIMRequestView}/>
    <Route path="/jwt_payload" component={LTI13PayloadView}/>
    <Route path="/setup_page" component={SetupView}/>
    <Route path="/deep_link" component={DeepLinkView}/>
    <Route path="/deep_link_options" component={DeepLinkOptions}/>
  </Router>
), document.getElementById('root'));
