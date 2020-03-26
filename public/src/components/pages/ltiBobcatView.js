import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";

class LtiBadgerView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("jwtPayloadData")
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
          groups: jwtPayload.groups
        });
      });
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
        <p>We have received your LTI launch.</p>
        <p>
          <pre>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            ( \<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \ \<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; /
            /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            |\\<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; / /&nbsp;&nbsp;&nbsp;&nbsp;
            .-`````-.&nbsp;&nbsp; / ^`-.<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \ \&nbsp;&nbsp;&nbsp;
            /&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \_/&nbsp; (|) `o<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \\ \\&nbsp; /&nbsp;&nbsp;
            .---.&nbsp;&nbsp; \\ _&nbsp; ,--'<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \ \/&nbsp;&nbsp;
            /&nbsp;&nbsp;&nbsp;&nbsp; \,&nbsp; \( `^^^<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \&nbsp;&nbsp;
            \/\&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; (\&nbsp; )<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp; \&nbsp;&nbsp; )
            \&nbsp;&nbsp;&nbsp;&nbsp; ) \ \<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;    &nbsp; ) /__ \__&nbsp; ) (\ \___<br/>
            &nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;&nbsp;
            (___)))__))(__))(__)))
          </pre>
        </p>
        <p>{verified}</p>
      </div>
    );
  }
}

export default LtiBadgerView;
