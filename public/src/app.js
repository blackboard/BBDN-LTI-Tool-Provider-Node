import React from "react";
import ReactDOM from "react-dom";
import {BrowserRouter, Route, Switch} from 'react-router-dom';
import Dashboard from "./components/pages/dashboard";
import SetupView from './components/pages/setupView';

ReactDOM.render(
    <BrowserRouter>
      <Switch>
      <Route exact path="/setup" component={SetupView} />
      <Route path="/" component={Dashboard}/>
      </Switch>
    </BrowserRouter>, document.getElementById("root"));
