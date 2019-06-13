import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";

class NamesRolesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("nrPayloadData")
      .then(result => result.json())
      .then(nrPayload => {
        this.setState({
          url: nrPayload.url,
          body: nrPayload.body,
          differenceUrl: nrPayload.difference_url,
          nextUrl: nrPayload.next_url,
          origBody: nrPayload.orig_body,
          returnUrl: nrPayload.return_url
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);
    const diff =
      this.state.differenceUrl !== "" ? (
        <form action="/namesAndRoles2" method="POST">
          <input type="submit" value="NRPS Difference" />
          <input type="hidden" name="body" defaultValue={body} />
          <input type="hidden" name="url" defaultValue={this.state.differenceUrl} />
        </form>
      ) : (
        <Typography variant="body1" style={styles.notAvailable}>
          <b>No difference link</b>
        </Typography>
      );
    const next =
      this.state.nextUrl !== "" ? (
        <form action="/namesAndRoles2" method="POST">
          <input type="submit" value="NRPS Next" />
          <input type="hidden" name="body" defaultValue={body} />
          <input type="hidden" name="url" defaultValue={this.state.nextUrl} />
        </form>
      ) : (
        <Typography variant="body1" style={styles.notAvailable}>
          No next link
        </Typography>
      );

    return (
      <div>
        <Typography variant="h4" gutterBottom>
          Names and Roles Service
        </Typography>

        <div>
          <Typography variant="body1">
            What would you like to do?
          </Typography>
          <ul style={styles.ulNoDecoration}>
            <li>
              <form action={this.state.returnUrl} method="post">
                <input type="submit" value="Return to Learn"/>
              </form>
            </li>
            <li>
              <form action="/namesAndRoles" method="post">
                <input type="submit" value="Names and Roles"/>
                <input type="hidden" name="body" defaultValue={body}/>
              </form>
            </li>
            <li>
              {diff}
            </li>
            <li>
              {next}
            </li>
          </ul>

          <br />
          <Typography variant="h5">
            Names and Roles Response
          </Typography>
          <JSONTree data={this.state.body} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        </div>
      </div>
    );
  }
}

export default NamesRolesView;
