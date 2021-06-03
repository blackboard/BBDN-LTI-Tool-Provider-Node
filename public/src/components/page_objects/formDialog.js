import AddIcon from '@material-ui/icons/Add';
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  MenuItem,
  TextField,
  Tooltip
} from '@material-ui/core';
import { openSnackbar } from './snackbar';

const portals = [
  {
    value: 'https://devportal-stage.saas.bbpd.io',
    label: 'Stage (registrar-beta)'
  },
  {
    value: 'https://developer.blackboard.com',
    label: 'Production (registrar)'
  },
  {
    value: 'https://devportal-ci.dev.bbpd.io',
    label: 'CI (registrar-blue-next)'
  }
];

export default function FormDialog(props) {
  const { onAdd } = props;
  const [open, setOpen] = React.useState(false);
  const [appName, setAppName] = React.useState('');
  const [appId, setAppId] = React.useState('');
  const [devPortalUrl, setDevPortalUrl] = React.useState('');

  const handleClickAdd = () => {
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleSubmit = () => {
    const app = {
      'appId': appId,
      'appName': appName,
      'devPortalUrl': devPortalUrl,
    };
    const data = new URLSearchParams(app);
    fetch('/saveSetup', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded;charset=UTF-8'
      },
      body: data
    }).then(result => {
      if (result.status === 200) {
        openSnackbar({ message: 'Application saved!' });
        setOpen(false);
        setAppId('');
        setDevPortalUrl('');
        setAppName('');
        onAdd(app);
      } else {
        openSnackbar({ message: 'Error' });
      }
    });
  };

  return (
    <div>
      <Tooltip title="Add New Application">
        <Fab color="secondary" aria-label="add" onClick={handleClickAdd}>
          <AddIcon/>
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title">LTI Advantage Application Details</DialogTitle>
        <form id={'setupForm'}>
          <DialogContent>
            <DialogContentText>
              Enter the name and application ID provided in Developer Portal when the application was created there.
            </DialogContentText>

            <TextField
              required
              label="Application Name"
              variant="outlined"
              fullWidth={true}
              InputLabelProps={{
                shrink: true
              }}
              name={'appName'}
              value={appName}
              onInput={(e) => setAppName(e.target.value)}
            />
            <br/>
            <br/>
            <TextField
              required
              label="Application ID"
              variant="outlined"
              fullWidth={true}
              InputLabelProps={{
                shrink: true
              }}
              name={'appId'}
              value={appId}
              onInput={(e) => setAppId(e.target.value)}
            />
            <br/>
            <br/>
            <TextField
              select
              required
              label="Developer Portal"
              variant="outlined"
              fullWidth={true}
              InputLabelProps={{
                shrink: true
              }}
              name={'devPortalUrl'}
              value={devPortalUrl}
              onChange={(e) => setDevPortalUrl(e.target.value)}
            >
              {portals.map((option) => (
                <MenuItem key={option.value} value={option.value}>
                  {option.label}
                </MenuItem>
              ))}
            </TextField>
            <br/>
          </DialogContent>
          <DialogActions style={{ 'padding': '20px' }}>
            <Button onClick={handleClose} color="primary">
              Cancel
            </Button>
            <Button
              id={'save_button'}
              variant="contained"
              color="secondary"
              onClick={handleSubmit}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}
