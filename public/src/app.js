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
import LTIAdvView from './components/ltiAdvView';
import SetupView from './components/setupView';
import DeepLinkView from './components/deepLinkView';
import {DeepLinkOptions} from './components/deepLinkOptions';
import NamesRolesView from './components/namesRolesView';
import AssignGradesView from './components/assignGradesView';

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
    <Route path="/lti_adv_view" component={LTIAdvView}/>
    <Route path="/setup_page" component={SetupView}/>
    <Route path="/deep_link" component={DeepLinkView}/>
    <Route path="/deep_link_options" component={DeepLinkOptions}/>
    <Route path="/names_roles_view" component={NamesRolesView}/>
    <Route path="/assign_grades_view" component={AssignGradesView}/>
  </Router>
), document.getElementById('root'));
