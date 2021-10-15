import { Assignment } from '@material-ui/icons';
import PropTypes from 'prop-types';
import React from 'react';
import {
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
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
  },
  {
    value: 'other',
    label: 'Other'
  }
];

function FormField(props) {
  const { pasteable, pasteAction, fieldLabel, fieldName, fieldValue, onInput } = props;
  return (
    pasteable ?
      <TextField
        required
        label={fieldLabel}
        variant='outlined'
        fullWidth={true}
        InputLabelProps={{
          shrink: true
        }}
        name={fieldName}
        value={fieldValue}
        onInput={onInput}
        InputProps={{
          endAdornment:
            <InputAdornment position='end'>
              <Tooltip title={'Paste from clipboard'}>
                <IconButton onClick={() => {
                  clipboardy.read().then(pasteAction).catch(e => console.log(e));
                }}>
                  <Assignment/>
                </IconButton>
              </Tooltip>
            </InputAdornment>
        }}
      /> :
      <TextField
        required
        label={fieldLabel}
        variant='outlined'
        fullWidth={true}
        InputLabelProps={{
          shrink: true
        }}
        name={fieldName}
        value={fieldValue}
        onInput={onInput}/>
  );
}

export default function FormDialog(props) {
  const { onAdd, isDialogOpened, handleCloseDialog, app, editMode } = props;
  const [ appName, setAppName ] = React.useState('');
  const [ appId, setAppId ] = React.useState('');
  const [ devPortalUrl, setDevPortalUrl ] = React.useState('');
  const [ customPortal, setCustomPortal ] = React.useState('');
  const [ appKey, setAppKey ] = React.useState('');
  const [ appSecret, setAppSecret ] = React.useState('');

  const closeDialog = () => {
    handleCloseDialog(false);
  };

  const handleSubmit = () => {
    const app = {
      'appId': appId,
      'appName': appName,
      'devPortalUrl': devPortalUrl === 'other' ? customPortal : devPortalUrl,
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
        closeDialog();
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
      <Dialog open={isDialogOpened} onClose={closeDialog} aria-labelledby='form-dialog-title'>
        <DialogTitle id='form-dialog-title' style={{ paddingBottom: 0 }}>LTI Advantage Application Details</DialogTitle>
        <form id={'setupForm'}>
          <DialogContent>
            <DialogContentText>
              Enter the application info provided in Developer Portal.
            </DialogContentText>
            <br/>
            <FormField
              fieldLabel={'Application Name'}
              fieldName={'appName'}
              fieldValue={editMode ? app.appName : appName}
              pasteable={false}
              onInput={(e) => setAppName(e.target.value)}
            />
            <br/>
            <br/>
            <FormField
              fieldLabel={'Application Key'}
              fieldName={'appKey'}
              fieldValue={editMode ? app.key : appKey}
              pasteable={true}
              onInput={e => setAppKey(e.target.value)}
              pasteAction={t => setAppKey(t)}
            />
            <br/>
            <br/>
            <FormField
              fieldLabel={'Application Secret'}
              fieldName={'appSecret'}
              fieldValue={editMode ? app.secret : appSecret}
              pasteable={true}
              onInput={e => setAppSecret(e.target.value)}
              pasteAction={t => setAppSecret(t)}
            />
            <br/>
            <br/>
            <FormField
              fieldLabel={'Application ID'}
              fieldName={'appId'}
              fieldValue={editMode ? app.appId : appId}
              pasteable={true}
              onInput={e => setAppId(e.target.value)}
              pasteAction={t => setAppId(t)}
            />
            <br/>
            <br/>
            <TextField
              select
              required
              label='Developer Portal'
              variant='outlined'
              fullWidth={true}
              InputLabelProps={{
                shrink: true
              }}
              name={'devPortalUrl'}
              value={editMode ? app.devPortalUrl : devPortalUrl}
              onChange={(e) => setDevPortalUrl(e.target.value)}
            >
              {
                portals.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))
              }
            </TextField>
            <br/>
            <br/>
            {devPortalUrl === 'other' ?
              <TextField
                label={'Custom URL'}
                variant={'outlined'}
                fullWidth
                InputLabelProps={{
                  shrink: true
                }}
                name={'Custom URL'}
                value={customPortal}
                onChange={(e) => setCustomPortal(e.target.value)}
              />
              : ''}
            <br/>
          </DialogContent>
          <DialogActions style={{ 'padding': '20px' }}>
            <Button onClick={closeDialog} color='primary'>
              Cancel
            </Button>
            <Button
              id={'save_button'}
              variant='contained'
              color='secondary'
              onClick={handleSubmit}>
              Save
            </Button>
          </DialogActions>
        </form>
      </Dialog>
    </div>
  );
}

FormDialog.propTypes = {
  app: PropTypes.object,
  editMode: PropTypes.bool,
  onAdd: PropTypes.any,
  isDialogOpened: PropTypes.any,
  handleCloseDialog: PropTypes.func
};

FormField.propTypes = {
  fieldLabel: PropTypes.string,
  fieldName: PropTypes.string,
  fieldValue: PropTypes.any,
  onInput: PropTypes.func,
  pasteAction: PropTypes.func,
  pasteable: PropTypes.bool
};
