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
          claim: agPayload.claim,
          lineItems: agPayload.lineItems,
          lineItem: agPayload.lineItem,
          body: agPayload.body
        });
      });
  }

  render() {
    const body = JSON.stringify(this.state.origBody);

    return(
      <div>
        <div><h3>Assignment and Grade Service</h3></div>

        <div>
          <b>Assignment and Grade Claims</b>
          <JSONTree data={this.state.claim} hideRoot={true} />

          <span>What would you like to do?</span>
          <form action="/agsReadCols" method="post"><input type="submit" value="Read Columns" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.lineItems} /></form>
          <form action="/agsAddCol" method="post">
            <table>
              <tr>
                <td><input type="submit" value="Add Column" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.lineItems} /></td>
                <td><input type="text" name="score" size="10" placeholder="score" /></td>
                <td><input type="text" name="tagval" size="10" placeholder="name" /></td>
              </tr>
            </table>
          </form>
          <form action="/agsReadCols" method="post"><input type="submit" value="Read Column" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.lineItem} /></form>
          <form action="/agsDeleteCol" method="post"><input type="submit" value="Delete Column" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.lineItem} /></form>
          <form action="/agsResults" method="post"><input type="submit" value="Read Results" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.lineItem} /></form>
          <form action="/agsScores" method="post"><input type="submit" value="Send Scores" /><input type="hidden" name="body" value={body} /><input type="hidden" name="url" value={this.state.lineItem} /></form>

          <br/>
          <h4>Assignment and Grade Response</h4>
          <JSONTree data={this.state.body} hideRoot={true} />
        </div>
      </div>
    )
  }
}

module.exports = AssignGradesView;
