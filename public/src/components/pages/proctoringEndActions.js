import React from 'react';
import Typography from '@material-ui/core/Typography';
import parameters from "../../util/parameters";

const params = parameters.getInstance();

export default class ProctoringEndActionsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch(`getProctoringPayloadData?nonce=${params.getNonce()}`)
      .then(result => result.json())
      .then(proctoringServicePayload => {
        this.setState({
          returnUrl: proctoringServicePayload.return_url,
        });
      });
  }

  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Proctoring End: Actions
        </Typography>
        <br/>
        <Typography variant="h5" gutterBottom>
          Return URL
        </Typography>
        <Typography variant="body1">
          <a href={this.state.returnUrl} style={{ overflowWrap: 'break-word' }}>{this.state.returnUrl}</a>
        </Typography>
      </div>
    );
  }
}
