import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";
import { parameters } from '../../util/parameters';

const params = parameters.getInstance();

class LtiBobcatView extends React.Component {
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
          returnUrl: jwtPayload.return_url,
          errorUrl: jwtPayload.error_url,
          verified: jwtPayload.verified,
          namesRoles: jwtPayload.names_roles,
          grading: jwtPayload.grading,
          groups: jwtPayload.groups,
          sub: jwtPayload.body.sub,
          userName: jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/custom"]["userNameLTI"],
          userBatchUid: jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/lis"]["person_sourcedid"],
          courseId: jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/custom"]["courseIDLrn"],
          courseBatchUid: jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/custom"]["courseBatchUIDLrn"],
          courseTitle: jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/context"]["title"],
          courseUUID: jwtPayload.body["https://purl.imsglobal.org/spec/lti/claim/context"]["id"],
        });
      });

    console.log(`LtiBobcatView nonce ${params.getNonce()}`);
  }

  render() {
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
        <p>
          Username: {this.state.userName}<br/>
          User UUID: {this.state.sub}<br/>
          User BatchUID: {this.state.userBatchUid}<br/>
          Course ID: {this.state.courseId}<br/>
          Course Title: {this.state.courseTitle}<br/>
          Course UUID: {this.state.courseUUID}<br/>
          Course BatchUID: {this.state.courseBatchUid}<br/>
        </p>
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

        <JSONTree data={this.state.header} hideRoot={true} theme={styles.monokai} invertTheme={true} />

        <Typography variant="body1">
          <b>JWT Body</b>
        </Typography>
        <JSONTree data={this.state.body} hideRoot={true} theme={styles.monokai} invertTheme={true} />
      </div>
    );
  }
}

export default LtiBobcatView;
