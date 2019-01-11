import React from 'react';
import JSONTree from 'react-json-tree';

class NamesRolesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch('nrPayloadData')
      .then(result => result.json())
      .then((nrPayload) => {
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
    const diff = (this.state.differenceUrl !== "") ?
      <form action="/namesAndRoles2" method="POST"><input type="submit" value="NRPS Difference" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.differenceUrl} /></form> :
      <div><b>No difference link</b></div>;
    const next = (this.state.nextUrl !== "") ?
      <form action="/namesAndRoles2" method="POST"><input type="submit" value="NRPS Next" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.nextUrl} /></form> :
      <div><b>No next link</b></div>;

    return(
      <div>
        <div><h3>Names and Roles Service</h3></div>

        <div>
          <p>Some text about names and roles</p>
          <span>What would you like to do?</span>
          <form action={this.state.returnUrl} method="post"><input type="submit" value="Return to Learn" /></form>
          <form action="/namesAndRoles" method="post"><input type="submit" value="Names and Roles" /><input type="hidden" name="body" value={body} /></form>
          {diff}
          {next}

          <br/>
          <h4>Names and Roles Response</h4>
          <JSONTree data={this.state.body} hideRoot={true} />
        </div>
      </div>
    )
  }
}

module.exports = NamesRolesView;
