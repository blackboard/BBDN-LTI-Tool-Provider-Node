import Fab from "@material-ui/core/Fab";
import Icon from "@material-ui/core/Icon";
import { withStyles } from "@material-ui/core/styles";
import AddIcon from "@material-ui/icons/Add";
import DeleteIcon from "@material-ui/icons/Delete";
import NavigationIcon from "@material-ui/icons/Navigation";
import PropTypes from "prop-types";
import React from "react";

const styles = theme => ({
  fab: {
    margin: 0,
    top: "auto",
    right: 20,
    bottom: 20,
    left: "auto",
    position: "fixed"
  },
  extendedIcon: {
    marginRight: theme.spacing.unit
  }
});

const FloatingAddButton = props => {
  const { classes } = props;
  return (
    <div>
      <Fab color="secondary" aria-label="Add" className={classes.fab}>
        <AddIcon />
      </Fab>
    </div>
  );
};

const FloatingEditButton = () => {
  return (
    <div>
      <Fab color="secondary" aria-label="Edit">
        <Icon>edit_icon</Icon>
      </Fab>
    </div>
  );
};

const FloatingDeleteButton = () => {
  return (
    <div>
      <Fab disabled aria-label="Delete">
        <DeleteIcon />
      </Fab>
    </div>
  );
};

const WideFloatingButton = ({ message }) => {
  return (
    <div>
      <Fab variant="extended" id={"wide-fab-id"}>
        <NavigationIcon />
        {message}
      </Fab>
    </div>
  );
};

FloatingAddButton.propTypes = {
  classes: PropTypes.object.isRequired
};

FloatingEditButton.propTypes = {
  classes: PropTypes.object.isRequired
};

FloatingDeleteButton.propTypes = {
  classes: PropTypes.object.isRequired
};

WideFloatingButton.propTypes = {
  classes: PropTypes.object.isRequired
};

const AddFab = withStyles(styles)(FloatingAddButton);
const EditFab = withStyles(styles)(FloatingEditButton);
const DeleteFab = withStyles(styles)(FloatingDeleteButton);
const WideFab = withStyles(styles)(WideFloatingButton);

export { AddFab, EditFab, DeleteFab, WideFab };
