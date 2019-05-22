import Typography from "@material-ui/core/Typography/index";
import React, { Component } from "react";
import SimpleLineChart from "../page_objects/simpleLineChart";
import SimpleTable from "../page_objects/simpleTable";

class Overview extends Component {
  render() {
    return (
      <div>
        <Typography variant="h4" gutterBottom component="h2">
          Votes
        </Typography>
        <Typography component="div">
          <SimpleLineChart />
        </Typography>
        <Typography variant="h4" gutterBottom component="h2">
          Courses
        </Typography>
        <div>
          <SimpleTable />
        </div>
      </div>
    );
  }
}

export default Overview;
