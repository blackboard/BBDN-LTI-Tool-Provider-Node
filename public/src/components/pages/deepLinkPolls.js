import Button from "@material-ui/core/Button/index";
import React from "react";
import JSONTree from "react-json-tree";

class DeepLinkPolls extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
    this.createPoll = this.createPoll.bind(this);
  }

  componentDidMount() {
    fetch("dlPayloadData")
      .then(result => result.json())
      .then(dlPayload => {
        this.setState({
          header: dlPayload.header,
          body: dlPayload.body,
          returnUrl: dlPayload.return_url,
          errorUrl: dlPayload.error_url,
          verified: dlPayload.verified
        });
      });
  }

  createPoll() {
    alert("Insert create poll function here");
  }

  render() {
    const verified = this.state.verified ? (
      <span className="verified">
        Verified
        <br />
      </span>
    ) : (
      <span className="notverified">
        Verify failed
        <br />
      </span>
    );

    return (
      <div>
        <div>
          <p>
            We have received your LTI Deep Link launch. You can view the JSON
            below.
          </p>
          <span>What would you like to do?</span>
          <div>
            <Button
              variant={"outlined"}
              onClick={this.createPoll}
              color={"primary"}>
              Create Poll
            </Button>
          </div>
        </div>

        <br />
        <h4>Resource Launch</h4>
        {verified}

        <b>JWT Header</b>
        <JSONTree data={this.state.header} hideRoot={true} />

        <b>JWT Body</b>
        <JSONTree data={this.state.body} hideRoot={true} />
      </div>
    );
  }
}

export default DeepLinkPolls;
