import React from 'react';
import { Button, Grid, Switch, Typography } from '@material-ui/core';
import { DeepLinkBuilder, Messages, sampleJSON } from './deepLinkBuilder';
import parameters from '../../util/parameters';

const params = parameters.getInstance();

export default class DeepLinkOptions extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      custom_json: JSON.stringify(sampleJSON),
      custom_option: false,
      custom_ltiLinks: '1',
      embed_ltiLinks: '0',
      new_ltiLinks: '0',
      custom_contentLinks: '0',
      custom_files: '0',
      custom_htmls: '0',
      custom_images: '0',
      custom_message: '',
      custom_error: ''
    }
  }

  handleCustomJson = (event) => {
    this.setState( { ...this.state, custom_content: event.json })
  }

  handleSwitch = (event) => {
    this.setState({ ...this.state, [event.target.name]: event.target.checked });
  };

  handleChange = (event) => {
    this.setState({ ...this.state, [event.target.name]: event.target.value });
  };

  handleSubmit = () => {
    if (this.state.custom_option === "true" && this.state.custom_content === null) {
      this.setState({...this.state, custom_json: sampleJSON });
    }
    const data = new URLSearchParams(this.state);
    fetch(`/deepLinkContent?nonce=${params.getNonce()}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: data
    }).then(() => {
      this.props.history.push('/deep_link')
    })
  }

  render() {
    return(
      <div>
        <Typography variant="h4" gutterBottom><br/>
          Deep Linking Payload Options
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Choose Build-A-Payload to select from various content types or choose Custom JSON to add your own LTI
          compliant deep linking response.
        </Typography>
        <br/>
        <Grid component="label" container alignItems="center" spacing={3}>
          <Grid item><Typography variant="h6">Build-A-Payload</Typography></Grid>
          <Grid item role={'input'}>
            <Switch
              checked={this.state.custom_option}
              onChange={this.handleSwitch}
              color="secondary"
              size="medium"
              name="custom_option"
            />
          </Grid>
          <Grid item><Typography variant="h6">Custom JSON</Typography></Grid>
        </Grid>
        <DeepLinkBuilder
          custom_option={this.state.custom_option}
          custom_ltiLinks={this.state.custom_ltiLinks}
          embed_ltiLinks={this.state.embed_ltiLinks}
          new_ltiLinks={this.state.new_ltiLinks}
          custom_contentLinks={this.state.custom_contentLinks}
          custom_files={this.state.custom_files}
          custom_htmls={this.state.custom_htmls}
          custom_images={this.state.custom_images}
          handleChange={this.handleChange}
          handleCustomJson={this.handleCustomJson}
          error={this.state.error}
        />
        <br/>
        <Grid container direction={"column"} spacing={3}>
          <Grid item lg={6}>
            <Typography variant={"h6"} gutterBottom>Optionally set a custom message or error to send back</Typography>
          </Grid>
          <Grid item lg={6}>
            <Messages message={this.state.custom_message} error={this.state.custom_error} handleChange={this.handleChange}/>
          </Grid>
          <Grid item lg={6}>
            <Button
              id={'send_button'}
              size={"medium"}
              variant={"contained"}
              color={"secondary"}
              onClick={this.handleSubmit}>
              Submit
            </Button>
          </Grid>
        </Grid>
      </div>
    );
  }
}
