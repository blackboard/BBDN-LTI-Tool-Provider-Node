import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";

class GroupSetsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("groupSetsPayloadData")
      .then(result => result.json())
      .then(groupSetsPayload => {
        this.setState({
          url: groupSetsPayload.url,
          body: groupSetsPayload.body,
          nextUrl: groupSetsPayload.next_url,
          origBody: groupSetsPayload.orig_body,
          returnUrl: groupSetsPayload.return_url
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);
    const next =
      this.state.nextUrl !== "" ? (
        <form action="/groupsets" method="POST">
          <input type="submit" value="Group Sets Next" />
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
          Groups Service
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
              <form action="/groupsets" method="post">
                <input type="submit" value="Group Sets"/>
                <input type="hidden" name="body" defaultValue={body}/>
              </form>
            </li>
            <li>
              {next}
            </li>
          </ul>

          <br />
          <Typography variant="h5">
            Group Sets Response
          </Typography>
          <JSONTree data={this.state.body} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        </div>
      </div>
    );
  }
}

export default GroupSetsView;
