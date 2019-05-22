import Grid from "@material-ui/core/Grid/index";
import Typography from "@material-ui/core/Typography/index";
import React, { Component } from "react";
import { AddFab } from "../page_objects/buttons";
import PollCard from "../page_objects/pollCards";

class Polls extends Component {
  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom component="h2">
          Polls
        </Typography>
        <Grid container spacing={24}>
          <Grid item md={3}>
            <PollCard />
          </Grid>
          <Grid item md={3}>
            <PollCard />
          </Grid>
          <Grid item md={3}>
            <PollCard />
          </Grid>
        </Grid>
        <AddFab href={"./pollSetup"} />
      </div>
    );
  }
}

export default Polls;
