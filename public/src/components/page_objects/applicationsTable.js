import { Add, DeleteTwoTone, EditTwoTone, KeyboardArrowDown, KeyboardArrowUp } from '@material-ui/icons';
import FormDialog from './formDialog';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Box,
  Collapse, Fab,
  IconButton,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TableSortLabel,
  Toolbar, Tooltip,
} from '@material-ui/core';
import { lighten, makeStyles } from '@material-ui/core/styles';
import { openSnackbar } from './snackbar';

function descendingComparator(a, b, orderBy) {
  if (b[orderBy] < a[orderBy]) {
    return -1;
  }
  if (b[orderBy] > a[orderBy]) {
    return 1;
  }
  return 0;
}

function getComparator(order, orderBy) {
  return order === 'desc'
    ? (a, b) => descendingComparator(a, b, orderBy)
    : (a, b) => -descendingComparator(a, b, orderBy);
}

function stableSort(array, comparator) {
  const stabilizedThis = array.map((el, index) => [ el, index ]);
  stabilizedThis.sort((a, b) => {
    const order = comparator(a[0], b[0]);
    if (order !== 0) return order;
    return a[1] - b[1];
  });
  return stabilizedThis.map((el) => el[0]);
}

const headCells = [
  { id: 'appName', numeric: false, disablePadding: false, label: 'Application Name' },
  { id: 'appId', numeric: false, disablePadding: false, label: 'Application ID' },
  { id: 'devPortalUrl', numeric: false, disablePadding: false, label: 'Developer Portal' },
];

const useToolbarStyles = makeStyles((theme) => ( {
  root: {
    paddingLeft: theme.spacing(2),
    paddingRight: theme.spacing(1),
  },
  highlight:
    theme.palette.type === 'light'
      ? {
        color: theme.palette.secondary.main,
        backgroundColor: lighten(theme.palette.secondary.light, 0.85),
      }
      : {
        color: theme.palette.text.primary,
        backgroundColor: theme.palette.secondary.dark,
      },
  title: {
    flex: '1 1 100%',
  },
} ));

const useStyles = makeStyles((theme) => ( {
  root: {
    width: '100%',
  },
  collapsed: {
    '& > *': {
      borderBottom: 'unset',
    }
  },
  paper: {
    width: '100%',
    padding: '20px',
    marginBottom: theme.spacing(2),
  },
  table: {
    minWidth: 750,
  },
  visuallyHidden: {
    border: 0,
    clip: 'rect(0 0 0 0)',
    height: 1,
    margin: -1,
    overflow: 'hidden',
    padding: 0,
    position: 'absolute',
    top: 20,
    width: 1,
  },
} ));

const EnhancedTableToolbar = (props) => {
  const classes = useToolbarStyles();
  const { onAdd } = props;
  const [ isOpen, setIsOpen ] = React.useState(false);

  const handleOpen = () => {
    setIsOpen(!isOpen);
  };

  return (
    <Toolbar className={classes.root}>
      <Tooltip title='Add New Application'>
        <Fab color='secondary' aria-label='add' onClick={handleOpen}>
          <Add />
        </Fab>
      </Tooltip>
      <FormDialog onAdd={onAdd} isDialogOpened={isOpen} handleCloseDialog={() => setIsOpen(false)}/>
    </Toolbar>
  );
};

const EnhancedTableHead = props => {
  const { classes, order, orderBy, onRequestSort } = props;
  const createSortHandler = (property) => (event) => {
    onRequestSort(event, property);
  };

  return (
    <TableHead>
      <TableRow>
        <TableCell/>
        {headCells.map((headCell) => (
          <TableCell
            key={headCell.id}
            align={headCell.numeric ? 'right' : 'left'}
            padding={headCell.disablePadding ? 'none' : 'normal'}
            sortDirection={orderBy === headCell.id ? order : false}
          >
            <TableSortLabel
              active={orderBy === headCell.id}
              direction={orderBy === headCell.id ? order : 'asc'}
              onClick={createSortHandler(headCell.id)}
            >
              {headCell.label}
              {orderBy === headCell.id ? (
                <span className={classes.visuallyHidden}>
                  {order === 'desc' ? 'sorted descending' : 'sorted ascending'}
                </span>
              ) : null}
            </TableSortLabel>
          </TableCell>
        ))}
      </TableRow>
    </TableHead>
  );
};

const ApplicationRow = props => {
  const { row, onDelete, onAdd } = props;
  const classes = useStyles();
  const [ open, setOpen ] = React.useState(false);
  const [ dialogOpen, setDialogOpen ] = React.useState(false);

  const handleDialogOpen = () => {
    setDialogOpen(!dialogOpen);
  };

  const handleDeleteApplication = app => {
    const results = [];
    fetch(`/applications/${app}`, { method: 'DELETE' })
      .then(result => {
        if (result.status === 200) {
          results.push(app);
        } else {
          openSnackbar({ message: 'Something went wrong' });
        }
        return results;
      }).then(() => {
        openSnackbar({ message: `${app} has been deleted` });
      });
    onDelete(app);
  };

  return(
    <React.Fragment>
      <TableRow className={classes.collapsed} hover>
        <TableCell>
          <IconButton size='medium' onClick={() => setOpen(!open)}>
            {open ? <KeyboardArrowUp/> : <KeyboardArrowDown/>}
          </IconButton>
        </TableCell>
        <TableCell component='th' scope='row'>
          {row.appName}
        </TableCell>
        <TableCell>{row.appId}</TableCell>
        <TableCell>{row.devPortalUrl}</TableCell>
        <TableCell>
          <IconButton size={'medium'} onClick={handleDialogOpen}>
            <EditTwoTone/>
          </IconButton>
          <IconButton size={'medium'} onClick={() => handleDeleteApplication(row.appId)}>
            <DeleteTwoTone/>
          </IconButton>
        </TableCell>
        <FormDialog editMode={true} onAdd={onAdd} app={row} isDialogOpened={dialogOpen}
          handleCloseDialog={() => setDialogOpen(false)} />
      </TableRow>
      <TableRow style={{ borderBottom: 'unset'}}>
        <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={8}>
          <Collapse in={open} timeout='auto' unmountOnExit>
            <Box marginLeft={15} marginBottom={5}>
              <Table size={'small'} style={{ width: '45%' }}>
                <TableBody>
                  <TableRow>
                    <TableCell>Key</TableCell>
                    <TableCell>{row.key}</TableCell>
                  </TableRow>
                  <TableRow key={row.appId}>
                    <TableCell>Secret</TableCell>
                    <TableCell>{row.secret}</TableCell>
                  </TableRow>
                </TableBody>
              </Table>
            </Box>
          </Collapse>
        </TableCell>
      </TableRow>
    </React.Fragment> );
};

export default function ApplicationsTable(props) {
  const { rows, onDelete, onAdd } = props;
  const classes = useStyles();
  const [ order, setOrder ] = React.useState('asc');
  const [ orderBy, setOrderBy ] = React.useState('appName');
  const [ page, setPage ] = React.useState(0);
  const [ rowsPerPage, setRowsPerPage ] = React.useState(10);

  const handleRequestSort = (event, property) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const emptyRows = rowsPerPage - Math.min(rowsPerPage, rows.length - page * rowsPerPage);

  return (
    <div className={classes.root}>
      <Paper className={classes.paper} elevation={3}>
        <EnhancedTableToolbar
          onAdd={onAdd}
        />
        <TableContainer>
          <Table
            className={classes.table}
            aria-labelledby='tableTitle'
            aria-label='applications table'
          >
            <EnhancedTableHead
              classes={classes}
              order={order}
              orderBy={orderBy}
              onRequestSort={handleRequestSort}
              rowCount={rows.length}
            />
            <TableBody>
              {stableSort(rows, getComparator(order, orderBy))
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row) => {
                  return (
                    <ApplicationRow row={row} key={row.appId} onDelete={onDelete} onEdit={onAdd}/>
                  );
                })}
              {emptyRows > 0 && (
                <TableRow style={{ height: ( 53 ) * emptyRows }}>
                  <TableCell colSpan={6}/>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
        <TablePagination
          rowsPerPageOptions={[ 5, 10, 25 ]}
          component='div'
          count={rows.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>
    </div>
  );
}

ApplicationsTable.propTypes = {
  rows: PropTypes.array,
  onDelete: PropTypes.func,
  onAdd: PropTypes.func
};

ApplicationRow.propTypes = {
  row: PropTypes.any,
  onAdd: PropTypes.func,
  onDelete: PropTypes.func,
};

EnhancedTableHead.propTypes = {
  classes: PropTypes.any,
  order: PropTypes.any,
  orderBy: PropTypes.string,
  rowCount: PropTypes.number,
  onRequestSort: PropTypes.func
};

EnhancedTableToolbar.propTypes = {
  numSelected: PropTypes.number,
  selectedApps: PropTypes.any,
  resetSelected: PropTypes.any,
  onAdd: PropTypes.any
};
