import React from 'react';
import Typography from '@material-ui/core/Typography';
import parameters from '../../util/parameters';
import { styles } from '../../common/styles/custom.js';
import JSONInput from 'react-json-editor-ajrm';
import locale from 'react-json-editor-ajrm/locale/en';

const params = parameters.getInstance();

export default class LtiBobcatView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch(`jwtPayloadData?nonce=${params.getNonce()}`)
      .then(result => result.json())
      .then(jwtPayload => {
        this.setState({
          header: jwtPayload.header,
          body: jwtPayload.body,
          verified: jwtPayload.verified,
          sub: jwtPayload.body.sub,
          userName: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/custom']['userNameLTI'],
          userBatchUid: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/lis']['person_sourcedid'],
          courseId: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/custom']['courseIDLrn'],
          courseBatchUid: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/custom']['courseBatchUIDLrn'],
          courseTitle: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/context']['title'],
          courseUUID: jwtPayload.body['https://purl.imsglobal.org/spec/lti/claim/context']['id'],
        });
      });

    fetch(`courseData?nonce=${params.getNonce()}`)
      .then(result => result.json())
      .then(courseData => {
        console.log(`ltiBobcatView course created: ${courseData.created}`);
        this.setState({
          courseCreated: courseData.created
        });
      });

    console.log(`LtiBobcatView nonce ${params.getNonce()}`);
  }

  render() {
    const tableStyle = {
      textAlign: 'left',
    };

    const verified = this.state.verified ? (
      <Typography variant="body1" style={styles.passed}>
        Verified
      </Typography>
    ) : (
      <Typography variant="body1" style={styles.failed}>
        Verify failed
      </Typography>
    );

    return (
      <div>
        <p>We have received your LTI 1.3 launch. Thanks for playing.</p>
        <table style={tableStyle}>
          <thead>
          <tr>
            <th scope="col">Key</th>
            <th scope="col">Value</th>
          </tr>
          </thead>
          <tbody>
          <tr>
            <th scope="row">Username</th>
            <td>{this.state.userName}</td>
          </tr>
          <tr>
            <th scope="row">User UUID</th>
            <td>{this.state.sub}</td>
          </tr>
          <tr>
            <th scope="row">User BatchUID</th>
            <td>{this.state.userBatchUid}</td>
          </tr>
          <tr>
            <th scope="row">Course ID</th>
            <td>{this.state.courseId}</td>
          </tr>
          <tr>
            <th scope="row">Course Title</th>
            <td>{this.state.courseTitle}</td>
          </tr>
          <tr>
            <th scope="row">Course UUID</th>
            <td>{this.state.courseUUID}</td>
          </tr>
          <tr>
            <th scope="row">Course BatchUID</th>
            <td>{this.state.courseBatchUid}</td>
          </tr>
          <tr>
            <th scope="row">Course Created</th>
            <td>{this.state.courseCreated}</td>
          </tr>
          </tbody>
        </table>
        {/*
        <p>
          Body: {JSON.stringify(this.state.body)}
        </p>
        */}
        <p>
          <pre>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; ( \<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \ \<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; |\\<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / /&nbsp;&nbsp;&nbsp;&nbsp; .-`````-.&nbsp;&nbsp; / ^`-.<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \ \&nbsp;&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \_/&nbsp; (|) `o<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \ \&nbsp; /&nbsp;&nbsp; .---.&nbsp;&nbsp; \\ _&nbsp; ,--'<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \ \/&nbsp;&nbsp; /&nbsp;&nbsp;&nbsp;&nbsp; \,&nbsp; \( `^^^<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \&nbsp;&nbsp; \/\&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (\&nbsp; )<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \&nbsp;&nbsp; ) \&nbsp;&nbsp;&nbsp;&nbsp; ) \ \<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    &nbsp; ) /__ \__&nbsp; ) (\ \___<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (___)))__))(__))(__)))
          </pre>
        </p>
        <p>{verified}</p>

        <Typography variant="h6">
          Response JWT
        </Typography>
        <JSONInput
          id="jwt_header"
          viewOnly={true}
          confirmGood={false}
          placeholder={this.state.decodedJwt.header}
          theme={'dark_vscode_tribute'}
          style={{ body: styles.jsonEditor }}
          locale={locale}
          height="100%"
          width="100%"
        />
        <Typography variant="h6">
          <b>JWT Body</b>
        </Typography>
        <JSONInput
          id="jwt_body"
          viewOnly={true}
          confirmGood={true}
          placeholder={this.state.decodedJwt.payload}
          theme={'dark_vscode_tribute'}
          style={{ body: styles.jsonEditor }}
          locale={locale}
          height="100%"
          width={'100%'}
        />
      </div>
    );
  }
}
