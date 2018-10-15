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
          token: nrPayload.token,
          header: nrPayload.jwtPayload.header,
          body: nrPayload.jwtPayload.body,
          verified: nrPayload.jwtPayload.verified,
          origBody: nrPayload.orig_body,
          returnUrl: nrPayload.return_url
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);
    const verified = (this.state.verified) ? <span className="verified">Verified<br/></span> : <span className="notverified">Verify failed<br/></span>;

    return(
      <div>
        <div><h3>Names and Roles</h3></div>

        <div>
          <p>Some text about names and roles</p>
          <span>What would you like to do?</span>
          <form action={this.state.returnUrl} method="post"><input type="submit" value="Return to Learn" /></form>
          <form action="/namesAndRoles" method="post"><input type="submit" value="Names and Roles" /><input type="hidden" name="body" value={body} /></form>

          <br/>
          <h4>Names and Roles Response</h4>
          {verified}

          <b>JWT Header</b>
          <JSONTree data={this.state.header} hideRoot={true} />

          <b>JWT Body</b>
          <JSONTree data={this.state.body} hideRoot={true} />
        </div>
      </div>
    )
  }
}

module.exports = NamesRolesView;
