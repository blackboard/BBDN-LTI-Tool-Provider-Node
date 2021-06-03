import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import config from '../../../../server/config/config.json';
import locale from 'react-json-editor-ajrm/locale/en';
import { Grid, TextField } from '@material-ui/core';
import { styles } from '../../common/styles/custom';

export const sampleJSON = {
  type: 'ltiResourceLink',
  title: 'An Embedded Resource',
  text: 'A description',
  url: `${config.frontend_url}lti13`,
  iframe: {
    width: 500,
    height: 800
  }
};

const CustomEditor = (props) => {
  const { handleCustomJson } = props;
  return (
    <JSONInput
      id={'custom_json'}
      viewOnly={false}
      confirmGood
      placeholder={sampleJSON}
      style={{ body: styles.jsonEditor }}
      locale={locale}
      height={'100%'}
      width={'100%'}
      onChange={handleCustomJson}
    /> );
};

const PayloadBuilder = (props) => {
  const {
    custom_ltiLinks,
    embed_ltiLinks,
    new_ltiLinks,
    custom_contentLinks,
    custom_files,
    custom_htmls,
    custom_images,
    handleChange,
  } = props;

  return (
    <Grid container direction="column" spacing={3}>
      <Grid item xs>
        <TextField
          variant="outlined"
          name="custom_ltiLinks"
          type={'number'}
          onInput={handleChange}
          label="LTI Links"
          value={custom_ltiLinks}
        />
      </Grid>
      <Grid item xs>
        <TextField
          variant="outlined"
          name="embed_ltiLinks"
          type={'number'}
          onInput={handleChange}
          label="Embedded LTI Links"
          value={embed_ltiLinks}
        />
      </Grid>
      <Grid item xs>
        <TextField
          variant="outlined"
          name="new_ltiLinks"
          type={'number'}
          onInput={handleChange}
          label="New Window Links"
          value={new_ltiLinks}
        />
      </Grid>
      <Grid item xs>
        <TextField
          variant="outlined"
          name="custom_contentLinks"
          type={'number'}
          onInput={handleChange}
          label="Content Links"
          value={custom_contentLinks}
        />
      </Grid>
      <Grid item xs>
        <TextField
          variant="outlined"
          name="custom_files"
          type={'number'}
          onInput={handleChange}
          label="Files"
          value={custom_files}
        />
      </Grid>
      <Grid item xs>
        <TextField
          variant="outlined"
          name="custom_htmls"
          type={'number'}
          onInput={handleChange}
          label="HTML Snippets"
          value={custom_htmls}
        />
      </Grid>
      <Grid item xs>
        <TextField
          variant="outlined"
          name="custom_images"
          type={'number'}
          onInput={handleChange}
          label="Images"
          value={custom_images}
        />
      </Grid>
    </Grid>
  );
};

export const Messages = (props) => {
  const { message, error, handleChange } = props;

  return (
    <Grid container direction={'column'} spacing={3}>
      <Grid item xs lg={6}>
        <TextField
          variant="outlined"
          fullWidth
          name="custom_message"
          value={message}
          onInput={handleChange}
          label="Custom message to send back to Learn"
          placeholder={'I have a message'}
        />
      </Grid>
      <Grid item xs lg={6}>
        <TextField
          variant="outlined"
          fullWidth
          value={error}
          name="custom_error"
          onInput={handleChange}
          label="Custom error message to display to user"
          placeholder={'I have an error'}
        />
      </Grid>
    </Grid>
  );
};

export const DeepLinkBuilder = (props) => {
  const {
    custom_option,
    custom_contentLinks,
    custom_files,
    custom_htmls,
    custom_images,
    custom_ltiLinks,
    error,
    new_ltiLinks,
    embed_ltiLinks,
    handleChange,
    handleCustomJson
  } = props;

  return (
    <div>
      {custom_option ?
        <CustomEditor handleChange={handleChange} handleCustomJson={handleCustomJson}/>
        :
        <PayloadBuilder
          custom_contentLinks={custom_contentLinks}
          custom_files={custom_files}
          custom_htmls={custom_htmls}
          custom_ltiLinks={custom_ltiLinks}
          custom_images={custom_images}
          embed_ltiLinks={embed_ltiLinks}
          new_ltiLinks={new_ltiLinks}
          handleChange={handleChange}
          error={error}
        />}
    </div>
  );
};
