import ApplicationsTable from '../page_objects/applicationsTable';
import React from 'react';

export default class ApplicationsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      rows: []
    };
  }

  componentDidMount() {
    fetch('/applications/all')
      .then(result => result.json())
      .then(data => {
        data.forEach(obj => {
          this.setState({
            rows: [...this.state.rows, {
              'appName': obj.setup.name,
              'appId': obj.id,
              'devPortalUrl': obj.setup.devPortalUrl
            }]
          });
        });
      });
  }

  onDelete = (appIds) => {
    this.setState({
      ...this.state,
      rows: this.state.rows.filter(r => !appIds.includes(r.appId))
    });
  }

  onAdd = (app) => {
    this.setState({
      rows: [...this.state.rows, {
        "appName": app.appName,
        "appId": app.appId,
        "devPortalUrl": app.devPortalUrl
      }]
    });
  }

  render() {
    return ( <ApplicationsTable rows={this.state.rows} onDelete={this.onDelete} onAdd={this.onAdd}/> );
  }
}
