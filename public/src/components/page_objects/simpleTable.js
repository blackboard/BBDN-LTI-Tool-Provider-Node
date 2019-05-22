import Paper from "@material-ui/core/Paper/index";
import { withStyles } from "@material-ui/core/styles/index";
import Table from "@material-ui/core/Table/index";
import TableBody from "@material-ui/core/TableBody/index";
import TableCell from "@material-ui/core/TableCell/index";
import TableHead from "@material-ui/core/TableHead/index";
import TableRow from "@material-ui/core/TableRow/index";
import PropTypes from "prop-types";
import React from "react";

const styles = {
  root: {
    width: "100%",
    overflowX: "auto"
  },
  table: {
    minWidth: 700
  }
};

let id = 0;
function createData(name, calories, fat, carbs, protein) {
  id += 1;
  return { id, name, calories, fat, carbs, protein };
}

const data = [
  createData(
    "Operations, Fundamentalism, and Intersectionality",
    159,
    6.0,
    24,
    4.0
  ),
  createData("Service, Grief, and Russia", 237, 9.0, 37, 4.3),
  createData("Yield, Management, and Service", 262, 16.0, 24, 6.0),
  createData("Modeling and Media in the Sixteenth Century", 305, 3.7, 67, 4.3),
  createData("Mass and Design in Transition", 356, 16.0, 49, 3.9)
];

function SimpleTable(props) {
  const { classes } = props;

  return (
    <Paper className={classes.root}>
      <Table className={classes.table}>
        <TableHead>
          <TableRow>
            <TableCell>Course Name</TableCell>
            <TableCell align="right">Students</TableCell>
            <TableCell align="right">Yes Votes</TableCell>
            <TableCell align="right">No Votes</TableCell>
            <TableCell align="right">Average Numer of Replies</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {data.map(n => (
            <TableRow key={n.id}>
              <TableCell component="th" scope="row">
                {n.name}
              </TableCell>
              <TableCell align="right">{n.calories}</TableCell>
              <TableCell align="right">{n.fat}</TableCell>
              <TableCell align="right">{n.carbs}</TableCell>
              <TableCell align="right">{n.protein}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Paper>
  );
}

SimpleTable.propTypes = {
  classes: PropTypes.object.isRequired
};

export default withStyles(styles)(SimpleTable);
