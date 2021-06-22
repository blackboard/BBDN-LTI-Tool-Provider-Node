import { Add, Assignment } from '@material-ui/icons';
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  Fab,
  IconButton,
  InputAdornment,
  MenuItem,
  TextField,
  Tooltip
} from '@material-ui/core';
import { openSnackbar } from './snackbar';
import * as clipboardy from 'clipboardy';

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
  const [appKey, setAppKey] = React.useState('');
  const [appSecret, setAppSecret] = React.useState('');

  const pasteFromClipboard = () => {
    clipboardy.read().then((t) => {
      return t;
    }).catch(e => console.log(e.message));
  };

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
      'appKey': appKey,
      'appSecret': appSecret
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
        setAppKey('');
        setAppSecret('');
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
          <Add/>
        </Fab>
      </Tooltip>
      <Dialog open={open} onClose={handleClose} aria-labelledby="form-dialog-title">
        <DialogTitle id="form-dialog-title" style={{ paddingBottom: 0 }}>LTI Advantage Application Details</DialogTitle>
        <form id={'setupForm'}>
          <DialogContent>
            <DialogContentText>
              Enter the application info provided in Developer Portal.
            </DialogContentText>
            <br/>
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
              label="Application Key"
              variant="outlined"
              fullWidth={true}
              InputLabelProps={{
                shrink: true
              }}
              name={'appKey'}
              value={appKey}
              onInput={(e) => setAppKey(e.target.value)}
              InputProps={{
                endAdornment:
                  <InputAdornment position="end">
                    <Tooltip title={'Paste from clipboard'}>
                      <IconButton onClick={() => {
                        clipboardy.read().then(t => setAppKey(t)).catch(e => console.log(e))
                      }}>
                        <Assignment/>
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
              }}
            />
            <br/>
            <br/>
            <TextField
              required
              label="Application Secret"
              variant="outlined"
              fullWidth={true}
              InputLabelProps={{
                shrink: true
              }}
              name={'appSecret'}
              value={appSecret}
              onInput={(e) => setAppSecret(e.target.value)}
              InputProps={{
                endAdornment:
                  <InputAdornment position="end">
                    <Tooltip title={'Paste from clipboard'}>
                      <IconButton onClick={() => {
                        clipboardy.read().then(t => setAppSecret(t)).catch(e => console.log(e))
                      }}>
                        <Assignment/>
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
              }}
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
              InputProps={{
                endAdornment:
                  <InputAdornment position="end">
                    <Tooltip title={'Paste from clipboard'}>
                      <IconButton onClick={() => {
                        clipboardy.read().then(t => setAppId(t)).catch(e => console.log(e))
                      }}>
                        <Assignment/>
                      </IconButton>
                    </Tooltip>
                  </InputAdornment>
              }}
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
