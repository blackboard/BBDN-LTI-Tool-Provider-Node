import React from 'react';
import JSONTree from 'react-json-tree';

class AssignGradesView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {};
  }

  componentDidMount() {
    fetch('agPayloadData')
      .then(result => result.json())
      .then((agPayload) => {
        this.setState({
          origBody: agPayload.orig_body,
          claim: agPayload.claim
        });
      });
  }

  render() {
    return(
      <div>
        <div><h3>Assignments and Grades</h3></div>

        <div>
          <p>Some text about assignments and grades</p>
          <p>Need to display returned JSON and probably provide soneother options too</p>
          <JSONTree data={this.state.claim} hideRoot={true} />
        </div>
      </div>
    )
  }
}

module.exports = AssignGradesView;
