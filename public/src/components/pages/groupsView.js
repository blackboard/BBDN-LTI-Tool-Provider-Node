import React from "react";
import JSONTree from "react-json-tree";
import Typography from "@material-ui/core/Typography";
import {styles} from "../../common/styles/custom.js";

class GroupsView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch("groupsPayloadData")
      .then(result => result.json())
      .then(groupsPayload => {
        this.setState({
          url: groupsPayload.url,
          body: groupsPayload.body,
          nextUrl: groupsPayload.next_url,
          origBody: groupsPayload.orig_body,
          returnUrl: groupsPayload.return_url
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);
    const next =
      this.state.nextUrl !== "" ? (
        <form action="/groups" method="POST">
          <input type="submit" value="Groups Next" />
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
              <form action="/groups" method="post">
                <input type="submit" value="Groups"/>
                <input type="hidden" name="body" defaultValue={body}/>
              </form>
            </li>
            <li>
              {next}
            </li>
          </ul>

          <br />
          <Typography variant="h5">
            Groups Response
          </Typography>
          <JSONTree data={this.state.body} hideRoot={true} theme={styles.monokai} invertTheme={true} />
        </div>
      </div>
    );
  }
}

export default GroupsView;
