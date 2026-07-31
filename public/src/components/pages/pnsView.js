import JSONInput from 'react-json-editor-ajrm';
import React from 'react';
import locale from 'react-json-editor-ajrm/locale/en';
import {
  Button,
  Drawer,
  FormControlLabel,
  MenuItem,
  Switch,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography
} from '@material-ui/core';
import { styles } from '../../common/styles/custom';
import { withStyles } from '@material-ui/core/styles';

const CustomTableCell = withStyles(() => ( {
  head: {
    fontSize: 16,
    fontWeight: 'bold',
    padding: 4
  },
  body: {
    fontSize: 14,
    padding: 4
  }
} ))(TableCell);

// Claim URIs as they actually arrive in a notice, confirmed against a real delivery on 2026-07-31.
// NOTE the namespace split: activity and submission arrive under `lti-aip`, while assetservice
// arrives under `lti-ap` -- which is the Proctoring specification's namespace. Both are read here
// because the drawer's job is to show what Learn really sent, not what it ought to send.
const CLAIM = {
  notice: 'https://purl.imsglobal.org/spec/lti/claim/notice',
  activity: 'https://purl.imsglobal.org/spec/lti-aip/claim/activity',
  submission: 'https://purl.imsglobal.org/spec/lti-aip/claim/submission',
  assetService: 'https://purl.imsglobal.org/spec/lti-ap/claim/assetservice',
  assetServiceAlt: 'https://purl.imsglobal.org/spec/lti-aip/claim/assetservice',
  context: 'https://purl.imsglobal.org/spec/lti/claim/context',
  forUser: 'https://purl.imsglobal.org/spec/lti/claim/for_user',
  deploymentId: 'https://purl.imsglobal.org/spec/lti/claim/deployment_id',
  version: 'https://purl.imsglobal.org/spec/lti/claim/version'
};

// Tolerate either namespace so the drawer keeps working if Learn corrects the assetservice URI.
const assetServiceClaim = (body) =>
  ( body && ( body[CLAIM.assetService] || body[CLAIM.assetServiceAlt] ) ) || null;

const formatBytes = (size) => ( typeof size === 'number' ? `${size} B` : '--' );

// iat/exp are numeric epoch seconds in a JWT, not ISO strings
const formatEpoch = (seconds) =>
  ( typeof seconds === 'number' ? new Date(seconds * 1000).toLocaleTimeString() : '--' );

// Learn re-enqueues a failed delivery immediately with no backoff. Measured against a real retry
// sequence on 2026-07-31: all five attempts landed in 385ms (gaps of 113/95/88/89ms). No polling
// interval can show a burst that fast unfolding, so this switch is NOT for watching retries - it is
// simply so a delivery shows up without having to click Refresh. Every attempt is persisted as its
// own row, so nothing is lost either way.
const AUTO_REFRESH_MS = 5000;

// A notice id is a uuid; show enough to correlate rows without dominating the table
const shortId = (id) => ( id ? `${id.substring(0, 8)}...` : '--' );

const formatTime = (iso) => {
  if (!iso) {
    return '--';
  }
  // Local time is what you compare against the Learn log while testing
  return new Date(iso).toLocaleTimeString();
};

// Learn returns its REST errors as a JSON string nested inside our error field, e.g.
// 'Registration failed: {"status":404,"message":"API is not found for the specified URL."}'.
// Unwrap it so the tester reads the message instead of escaped braces.
const unwrapMessage = (text) => {
  const start = text.indexOf('{');
  if (start === -1) {
    return text;
  }
  try {
    const parsed = JSON.parse(text.substring(start));
    const detail = parsed.message || parsed.error || parsed.error_description;
    return detail ? text.substring(0, start) + detail : text;
  } catch (err) {
    return text;
  }
};

class PnsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      loading: true,
      loadError: null,
      status: null,
      deliveries: [],
      togglingFailMode: false,
      busy: false,
      actionResult: null,
      regDeploymentId: '',
      regNoticeType: '',
      regHandler: '',
      unregDeploymentId: '',
      autoRefresh: false,
      selectedDelivery: null
    };
    this.refreshTimer = null;
    this.load = this.load.bind(this);
    this.refreshQuietly = this.refreshQuietly.bind(this);
    this.toggleAutoRefresh = this.toggleAutoRefresh.bind(this);
    this.stopAutoRefresh = this.stopAutoRefresh.bind(this);
    this.openDelivery = this.openDelivery.bind(this);
    this.closeDelivery = this.closeDelivery.bind(this);
    this.toggleFailMode = this.toggleFailMode.bind(this);
    this.register = this.register.bind(this);
    this.unregister = this.unregister.bind(this);
    this.verify = this.verify.bind(this);
    this.onFieldChange = this.onFieldChange.bind(this);
  }

  componentDidMount() {
    this.load();
  }

  componentWillUnmount() {
    this.stopAutoRefresh();
  }

  // load() is the Refresh button's onClick, so it must ignore its event argument - hence the
  // separate quiet path rather than a load(quiet) flag that an event object would satisfy.
  load() {
    this.fetchState(false);
  }

  // A poll must not flip `loading`, or the whole view would blink back to "Loading..." every tick.
  refreshQuietly() {
    this.fetchState(true);
  }

  // Both endpoints already return exactly what this view needs, so there is no
  // server-side payload object to keep in sync.
  fetchState(quiet) {
    if (!quiet) {
      this.setState({ loading: true, loadError: null });
    }

    Promise.all([
      fetch('/pns').then(res => res.json()),
      fetch('/pns/deliveries').then(res => res.json())
    ])
      .then(([ status, deliveries ]) => {
        const registrations = ( status && status.registrations ) || [];
        const newest = registrations.length > 0 ? registrations[registrations.length - 1] : null;

        this.setState(prev => ( {
          status: status,
          deliveries: Array.isArray(deliveries) ? deliveries : [],
          loading: false,
          // Unregister requires a deploymentId, so prefill it from the live registration.
          // Only when the field is untouched, otherwise typing would be clobbered on refresh.
          unregDeploymentId: prev.unregDeploymentId || ( newest ? newest.deploymentId : '' )
        } ));
      })
      .catch(err => {
        this.setState({ loadError: err.message, loading: false });
      });
  }

  // Off by default and opt-in: nothing else in this tool polls, and a delivery is something you
  // trigger deliberately. It earns its place only while watching a retry sequence arrive.
  toggleAutoRefresh(event) {
    if (event.target.checked) {
      this.stopAutoRefresh();
      this.refreshTimer = setInterval(this.refreshQuietly, AUTO_REFRESH_MS);
      this.setState({ autoRefresh: true });
    } else {
      this.stopAutoRefresh();
      this.setState({ autoRefresh: false });
    }
  }

  stopAutoRefresh() {
    if (this.refreshTimer) {
      clearInterval(this.refreshTimer);
      this.refreshTimer = null;
    }
  }

  // The row already holds the whole delivery record, so opening the drawer needs no extra fetch.
  openDelivery(delivery) {
    this.setState({ selectedDelivery: delivery });
  }

  closeDelivery() {
    this.setState({ selectedDelivery: null });
  }

  // POST /pns/failmode takes a strict JSON boolean: anything else (including the
  // string "true") silently resolves to false. Sending a real boolean from here
  // removes that trap, and we re-read the state rather than assuming it applied.
  toggleFailMode(event) {
    const enabled = event.target.checked;
    this.setState({ togglingFailMode: true });

    fetch('/pns/failmode', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ enabled: enabled })
    })
      .then(res => res.json())
      .then(() => {
        this.setState({ togglingFailMode: false });
        this.load();
      })
      .catch(err => {
        this.setState({ togglingFailMode: false, loadError: err.message });
      });
  }

  onFieldChange(field) {
    return (event) => this.setState({ [field]: event.target.value });
  }

  // fetch() does not reject on 4xx/5xx, and these endpoints put the useful
  // error/hint text in the response body, so always parse the body and judge on res.ok.
  postAction(url, body) {
    this.setState({ busy: true, actionResult: null });

    return fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body)
    })
      .then(res => res.json().then(json => ( { ok: res.ok, status: res.status, body: json } )))
      .then(result => {
        this.setState({ busy: false, actionResult: result });
        this.load();
      })
      .catch(err => {
        this.setState({
          busy: false,
          actionResult: { ok: false, status: 0, body: { error: err.message } }
        });
      });
  }

  // All three fields are optional server-side: omitting them auto-detects from the
  // newest launch session, so only send what was actually filled in.
  register() {
    const body = {};
    if (this.state.regDeploymentId.trim()) {
      body.deploymentId = this.state.regDeploymentId.trim();
    }
    if (this.state.regNoticeType.trim()) {
      body.notice_type = this.state.regNoticeType.trim();
    }
    if (this.state.regHandler.trim()) {
      body.handler = this.state.regHandler.trim();
    }
    this.postAction('/pns/register', body);
  }

  unregister() {
    this.postAction('/pns/unregister', { deploymentId: this.state.unregDeploymentId.trim() });
  }

  // Read-only: asks Learn what it holds and compares. Safe to click at any time, and the only
  // action that works before the first Asset Processor launch.
  verify() {
    this.postAction('/pns/verify', {});
  }

  renderActions() {
    const { busy, status } = this.state;
    const registrations = ( status && status.registrations ) || [];
    const launchClaim = ( status && status.launchClaim ) || null;
    const supportedNoticeTypes = ( launchClaim && launchClaim.noticeTypesSupported ) || [];

    return (
      <div style={{ marginBottom: '20px' }}>
        <Typography variant='subtitle1' gutterBottom>
          <b>Verify</b> - read-only; asks Learn which handlers it currently holds and compares them
          against what is stored here. Needs no launch and changes nothing on either side.
        </Typography>
        <Button
          variant={'contained'}
          color={'primary'}
          disabled={busy || registrations.length === 0}
          onClick={this.verify}
          style={{ marginBottom: '16px' }}
        >
          Verify with Learn
        </Button>

        <Typography variant='subtitle1' gutterBottom>
          <b>Register</b> - requires a prior Asset Processor launch; leave fields empty to
          auto-detect from the most recent one, or set deploymentId to pick a specific launch
        </Typography>
        <TextField
          variant={'outlined'}
          size={'small'}
          label={'deploymentId (optional)'}
          value={this.state.regDeploymentId}
          onChange={this.onFieldChange('regDeploymentId')}
          style={{ marginRight: '8px', minWidth: '300px' }}
        />
        {/* Driven by the launch claim's notice_types_supported, so the list is exactly what the
            platform advertises. Falls back to free text before the first launch, otherwise there
            would be no way to type a notice type at all. */}
        <TextField
          variant={'outlined'}
          size={'small'}
          select={supportedNoticeTypes.length > 0}
          label={'notice_type (optional)'}
          value={this.state.regNoticeType}
          onChange={this.onFieldChange('regNoticeType')}
          helperText={supportedNoticeTypes.length > 0 ? 'from the launch claim' : 'no launch claim yet'}
          style={{ marginRight: '8px', minWidth: '260px' }}
        >
          {supportedNoticeTypes.length > 0 && [
            <MenuItem key='__auto' value=''><i>auto-select</i></MenuItem>,
            ...supportedNoticeTypes.map(type => (
              <MenuItem key={type} value={type}>{type}</MenuItem>
            ))
          ]}
        </TextField>
        <TextField
          variant={'outlined'}
          size={'small'}
          label={'handler URL (optional)'}
          value={this.state.regHandler}
          onChange={this.onFieldChange('regHandler')}
          style={{ marginRight: '8px', minWidth: '260px' }}
        />
        <Button
          variant={'contained'}
          color={'secondary'}
          disabled={busy}
          onClick={this.register}
        >
          Register
        </Button>

        <Typography variant='subtitle1' gutterBottom style={{ marginTop: '16px' }}>
          <b>Unregister</b> - deploymentId is required; prefilled from the current registration
        </Typography>
        <TextField
          variant={'outlined'}
          size={'small'}
          label={'deploymentId'}
          value={this.state.unregDeploymentId}
          onChange={this.onFieldChange('unregDeploymentId')}
          style={{ marginRight: '8px', minWidth: '300px' }}
        />
        <Button
          variant={'contained'}
          color={'secondary'}
          disabled={busy || registrations.length === 0 || !this.state.unregDeploymentId.trim()}
          onClick={this.unregister}
        >
          Unregister
        </Button>

        {busy && (
          <Typography variant='subtitle1' style={styles.notAvailable}>working...</Typography>
        )}
      </div>
    );
  }

  // The JSON viewer mangles strings that themselves contain JSON, which is exactly the shape
  // Learn's errors arrive in - so every message is also rendered as plain text below.
  collectMessages(body) {
    if (!body) {
      return [];
    }
    const raw = [];
    if (typeof body.error === 'string') {
      raw.push(body.error);
    }
    if (Array.isArray(body.errors)) {
      body.errors.forEach(entry => {
        if (entry && typeof entry.error === 'string') {
          raw.push(( entry.noticeType ? `${entry.noticeType}: ` : '' ) + entry.error);
        }
      });
    }
    return raw.map(unwrapMessage);
  }

  renderActionResult() {
    const { actionResult } = this.state;
    if (!actionResult) {
      return null;
    }

    const { ok, status, body } = actionResult;
    const messages = this.collectMessages(body);

    return (
      <div style={{ marginBottom: '20px' }}>
        <Typography variant='subtitle1'>
          <span style={ok ? styles.passed : styles.failed}>
            {ok ? 'Success' : `Failed (HTTP ${status || 'network error'})`}
          </span>
        </Typography>
        {messages.map((message, idx) => (
          <Typography key={idx} variant='body2' style={styles.failed}>
            {message}
          </Typography>
        ))}
        {body && body.hint && (
          <Typography variant='subtitle1' style={styles.notAvailable}>
            <b>Hint:</b> {body.hint}
          </Typography>
        )}
        <JSONInput
          id='pns_action_result'
          viewOnly={true}
          confirmGood={false}
          placeholder={body}
          theme='dark_vscode_tribute'
          style={{ body: styles.jsonEditor }}
          locale={locale}
          height='100%'
          width='max-content'
        />
      </div>
    );
  }

  renderStatus() {
    const { status } = this.state;
    const registrations = status.registrations || [];
    const registered = registrations.length > 0;

    return (
      <Table style={{ width: 'auto', marginBottom: '20px' }}>
        <TableBody>
          <TableRow>
            <CustomTableCell><b>Handler URL</b></CustomTableCell>
            <CustomTableCell>{status.handlerUrl}</CustomTableCell>
          </TableRow>
          <TableRow>
            <CustomTableCell><b>Registered</b></CustomTableCell>
            <CustomTableCell>
              <span style={registered ? styles.passed : styles.notAvailable}>
                {registered
                  ? registrations.map(r => r.noticeType).join(', ')
                  : 'no handler registered'}
              </span>
            </CustomTableCell>
          </TableRow>
          <TableRow>
            <CustomTableCell><b>Launch claim</b></CustomTableCell>
            <CustomTableCell>
              {status.launchClaim
                ? (
                  <span style={styles.passed}>
                    {status.launchClaim.deploymentId} -
                    supports {( status.launchClaim.noticeTypesSupported || [] ).join(', ') || 'nothing'}
                  </span>
                )
                : (
                  <span style={styles.notAvailable}>
                    none - launch the Asset Processor placement before registering
                  </span>
                )}
            </CustomTableCell>
          </TableRow>
          <TableRow>
            <CustomTableCell><b>Deliveries received</b></CustomTableCell>
            <CustomTableCell>{status.deliveryCount}</CustomTableCell>
          </TableRow>
          <TableRow>
            <CustomTableCell><b>Fail mode</b></CustomTableCell>
            <CustomTableCell>
              <FormControlLabel
                control={
                  <Switch
                    checked={Boolean(status.failMode)}
                    onChange={this.toggleFailMode}
                    disabled={this.state.togglingFailMode}
                    color='secondary'
                  />
                }
                label={
                  <span style={status.failMode ? styles.failed : styles.notAvailable}>
                    {status.failMode
                      ? 'ON - responding 500 to force Learn to retry'
                      : 'off - responding 200 normally'}
                  </span>
                }
              />
            </CustomTableCell>
          </TableRow>
        </TableBody>
      </Table>
    );
  }

  renderClaim() {
    const { status } = this.state;
    const registrations = status.registrations || [];

    // The PNS claim only reaches the tool via a launch; its absence is the first
    // thing to check when the feature flag is off on the Learn side.
    if (registrations.length === 0) {
      return (
        <Typography variant='subtitle1' style={styles.notAvailable}>
          <b>No registration yet</b> - launch the Asset Processor placement in Learn, then register a
          handler. If a launch has happened and the PNS claim is still missing, check that
          feature.asset.processor.pns is enabled on the Learn side.
        </Typography>
      );
    }

    return (
      <JSONInput
        id='pns_registration'
        viewOnly={true}
        confirmGood={false}
        placeholder={registrations[registrations.length - 1]}
        theme='dark_vscode_tribute'
        style={{ body: styles.jsonEditor }}
        locale={locale}
        height='100%'
        width='max-content'
      />
    );
  }

  renderDeliveries() {
    const { deliveries } = this.state;

    if (deliveries.length === 0) {
      return (
        <Typography variant='subtitle1' style={styles.notAvailable}>
          <b>No deliveries yet.</b> Register a handler, then submit as a student against a
          content item that has the Asset Processor attached.
        </Typography>
      );
    }

    return (
      <Table style={{ marginBottom: '20px' }}>
        <TableHead>
          <TableRow>
            <CustomTableCell>#</CustomTableCell>
            <CustomTableCell>Received</CustomTableCell>
            <CustomTableCell>Notice type</CustomTableCell>
            <CustomTableCell>Notice id</CustomTableCell>
            <CustomTableCell align='center'>Verified</CustomTableCell>
            <CustomTableCell align='center'>Duplicate</CustomTableCell>
            <CustomTableCell>Error</CustomTableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {deliveries.map((d, idx) => (
            <TableRow
              key={d.id || idx}
              hover
              style={{ cursor: 'pointer' }}
              onClick={() => this.openDelivery(d)}
              title='Click to inspect the notice claims'
            >
              <CustomTableCell>{deliveries.length - idx}</CustomTableCell>
              <CustomTableCell>{formatTime(d.receivedAt)}</CustomTableCell>
              <CustomTableCell>{d.noticeType || '--'}</CustomTableCell>
              <CustomTableCell title={d.noticeId || ''}>{shortId(d.noticeId)}</CustomTableCell>
              <CustomTableCell align='center'>
                {/* Notices are signed through the dev portal, so a verified notice is the
                    expected result - a false here is a real finding, not background noise. */}
                <span style={d.verified ? styles.passed : styles.failed}>
                  {d.verified ? 'yes' : 'NO'}
                </span>
              </CustomTableCell>
              <CustomTableCell align='center'>
                {d.isDuplicate ? 'yes' : ''}
              </CustomTableCell>
              <CustomTableCell>
                <span style={d.error ? styles.failed : styles.notAvailable}>
                  {d.error || '--'}
                </span>
              </CustomTableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  // The claims a tester actually needs after a delivery lands: which submission it was, and the
  // asset urls to call the asset service with. Everything else stays in the full-claims JSON below.
  renderDeliveryDrawer() {
    const { selectedDelivery } = this.state;
    if (!selectedDelivery) {
      return null;
    }

    const d = selectedDelivery;
    const body = d.jwtBody || {};
    const notice = body[CLAIM.notice] || {};
    const activity = body[CLAIM.activity] || {};
    const submission = body[CLAIM.submission] || {};
    const context = body[CLAIM.context] || {};
    const forUser = body[CLAIM.forUser] || {};
    const assetService = assetServiceClaim(body) || {};
    const assets = assetService.assets || [];

    const rows = [
      [ 'Notice id', notice.id || d.noticeId || '--' ],
      [ 'Notice type', notice.type || d.noticeType || '--' ],
      [ 'Notice timestamp', notice.timestamp || '--' ],
      [ 'Received', d.receivedAt || '--' ],
      [ 'Signature verified', d.verified ? 'yes' : 'NO' ],
      [ 'Duplicate', d.isDuplicate ? 'yes' : 'no' ],
      [ 'kid', ( d.jwtHeader && d.jwtHeader.kid ) || '--' ],
      [ 'alg', ( d.jwtHeader && d.jwtHeader.alg ) || '--' ],
      [ 'iss / aud', `${body.iss || '--'} / ${body.aud || '--'}` ],
      [ 'iat / exp', `${formatEpoch(body.iat)} / ${formatEpoch(body.exp)}` ],
      [ 'nonce', body.nonce || '--' ],
      [ 'deployment_id', body[CLAIM.deploymentId] || d.deploymentId || '--' ],
      [ 'LTI version', body[CLAIM.version] || '--' ],
      [ 'activity_id', activity.activity_id || '--' ],
      [ 'submission_id', submission.submission_id || '--' ],
      [ 'context', context.title ? `${context.title} (${context.label || '--'})` : '--' ],
      [ 'for_user', forUser.user_id || '--' ],
      [ 'eula_accepted_at', forUser.eula_accepted_at || '--' ],
      [ 'asset service scope', ( assetService.scope || [] ).join(', ') || '--' ]
    ];

    return (
      <Drawer anchor='right' open={true} onClose={this.closeDelivery}>
        <div style={{ width: '52rem', maxWidth: '95vw', padding: '16px' }}>
          <Typography variant='h5' gutterBottom>Notice detail</Typography>
          <Button variant='contained' color='secondary' onClick={this.closeDelivery}>Close</Button>

          <Typography variant='h6' style={{ marginTop: '16px' }}>Summary</Typography>
          <Table size='small'>
            <TableBody>
              {rows.map(([ label, value ]) => (
                <TableRow key={label}>
                  <CustomTableCell><b>{label}</b></CustomTableCell>
                  <CustomTableCell>
                    <span style={label === 'Signature verified' && !d.verified ? styles.failed : undefined}>
                      {value}
                    </span>
                  </CustomTableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          <Typography variant='h6' style={{ marginTop: '16px' }}>
            Assets ({assets.length})
          </Typography>
          {assets.length === 0
            ? (
              <Typography variant='body2' style={styles.notAvailable}>
                No assetservice claim on this notice.
              </Typography>
            )
            : (
              <Table size='small'>
                <TableHead>
                  <TableRow>
                    <CustomTableCell>asset_id</CustomTableCell>
                    <CustomTableCell>filename</CustomTableCell>
                    <CustomTableCell>content_type</CustomTableCell>
                    <CustomTableCell>size</CustomTableCell>
                    <CustomTableCell>url</CustomTableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {assets.map((a, i) => (
                    <TableRow key={a.asset_id || i}>
                      <CustomTableCell>{a.asset_id || '--'}</CustomTableCell>
                      <CustomTableCell>{a.filename || a.title || '--'}</CustomTableCell>
                      <CustomTableCell>{a.content_type || '--'}</CustomTableCell>
                      <CustomTableCell>{formatBytes(a.size)}</CustomTableCell>
                      <CustomTableCell style={{ wordBreak: 'break-all' }}>{a.url || '--'}</CustomTableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            )}

          <Typography variant='h6' style={{ marginTop: '16px' }}>All claims</Typography>
          <JSONInput
            id='pns_delivery_claims'
            viewOnly={true}
            confirmGood={false}
            placeholder={body}
            theme='dark_vscode_tribute'
            style={{ body: styles.jsonEditor }}
            locale={locale}
            height='100%'
            width='max-content'
          />

          <Typography variant='h6' style={{ marginTop: '16px' }}>Raw JWT</Typography>
          <Typography
            variant='body2'
            style={{ wordBreak: 'break-all', fontFamily: 'monospace', fontSize: '11px' }}
          >
            {d.rawJwt || '--'}
          </Typography>
        </div>
      </Drawer>
    );
  }

  render() {
    const { loading, loadError, status } = this.state;

    if (loading) {
      return <Typography variant='h4'>Loading...</Typography>;
    }

    if (loadError || !status) {
      return (
        <div>
          <Typography variant='h4' gutterBottom>Platform Notification Service</Typography>
          <Typography variant='subtitle1' style={styles.failed}>
            <b>Could not read PNS state:</b> {loadError || 'no status returned'}
          </Typography>
          <Button variant={'contained'} color={'secondary'} onClick={this.load}>Retry</Button>
        </div>
      );
    }

    return (
      <div>
        <Typography variant='h4' gutterBottom>
          Platform Notification Service
        </Typography>

        <Button variant={'contained'} color={'secondary'} onClick={this.load}>
          Refresh
        </Button>
        <FormControlLabel
          style={{ marginLeft: '16px' }}
          control={
            <Switch
              checked={this.state.autoRefresh}
              onChange={this.toggleAutoRefresh}
              color='primary'
            />
          }
          label={
            <span style={styles.notAvailable}>
              auto-refresh every {AUTO_REFRESH_MS / 1000}s
            </span>
          }
        />

        <Typography variant='h5' gutterBottom style={{ marginTop: '20px' }}>
          Status
        </Typography>
        {this.renderStatus()}

        <Typography variant='h5' gutterBottom>
          Actions
        </Typography>
        {this.renderActions()}
        {this.renderActionResult()}

        <Typography variant='h5' gutterBottom>
          Deliveries
        </Typography>
        {this.renderDeliveries()}
        {this.renderDeliveryDrawer()}

        <Typography variant='h5' gutterBottom>
          Current registration
        </Typography>
        <Typography variant='body2' style={styles.notAvailable} gutterBottom>
          The nested <code>discovery</code> block is the snapshot Learn returned <i>before</i> the
          handler was written, so its <code>handler</code> reads empty even on a successful
          registration. Use Verify with Learn to see Learn&apos;s current state.
        </Typography>
        {this.renderClaim()}
      </div>
    );
  }
}

export default PnsView;
