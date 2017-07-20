import $ from "jquery"
window.$ = $;
window.jQuery = $;
import ReactBootstrap from 'react-bootstrap'
import React from 'react'
import {render} from 'react-dom'
import {Router, Route, Link, browserHistory} from 'react-router'
import Registration from './components/registration'
import LaunchEndpoint from './components/launchEndpoint'
import ProviderTools from './components/providerTools'
import ContentItemView from './components/contentItemView'

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
  </Router>
), document.getElementById('root'));
