import React from 'react';
import Typography from '@material-ui/core/Typography/index';

export default class LaunchEndpoint extends React.Component {
  constructor(props) {
    super(props);
    this.state = { config: {} };
  }

  componentDidMount() {
    fetch('config')
      .then(result => result.json())
      .then(config => {
        this.setState({ config: config });
      });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Welcome to the LTI Testing Tool
        </Typography>
        <Typography variant="h5" gutterBottom>
          Click Applications in the menu to view a list of all registered apps.
        </Typography>
      </div>
    );
  }
}
