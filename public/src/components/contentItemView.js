import React from "react";

class DataItemList extends React.Component {

  render() {
    let items = [];
    const data = this.props.dataItems;
    const style = {
      listStyle: 'none'
    };
    const required = [
      'lti_version', 'lti_message_type', 'accept_media_types',
      'accept_presentation_document_targets', 'content_item_return_url'
    ];

    data.forEach((value, key, map) => {
      if (required.indexOf(key) >= 0) {
        items.push(<li className="reqd">{key} : {value}</li>);
      }
      else {
        items.push(<li>{key} : {value}</li>)
      }
    });

    return (
      <ul style={style}>
        {items}
      </ul>
    );
  }
}

class ContentItemView extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ciData: new Map([])
    };
  }

  componentDidMount() {
    fetch('contentitemdata')
      .then(result => result.json())
      .then((contentItemData) => {
        this.setState({
          ciData: this.buildMap(contentItemData.data),
          consumerKey: contentItemData.consumer_key,
          contentItems: contentItemData.content_items,
          ltiVersion: this.getEntry(contentItemData.data, "lti_version"),
          tcData: this.getEntry(contentItemData.data, "data"),
          returnUrl: this.getEntry(contentItemData.data, 'content_item_return_url'),
          oauth_nonce: contentItemData.oauth_nonce,
          oauth_timestamp: contentItemData.oauth_timestamp,
          oauth_signature: contentItemData.oauth_signature,
          oauth_signature_method: contentItemData.oauth_signature_method
        });
      })
  }

  buildMap(obj) {
   let map = new Map();
    Object.keys(obj).forEach(key => {
      map.set(key, obj[key]);
    });
    return map;
  }

  getEntry(obj, findKey) {
    let retVal = 'Not found';
    Object.keys(obj).forEach(key => {
      if (key === findKey) {
        retVal = obj[key];
      }
    });
    return retVal;
  }

  render() {
    const items = JSON.stringify(this.state.contentItems);

    return (
      <div>
        <div className="row">
          <div className="large-6 columns"><h2>LTI Content Item</h2></div>
        </div>

        <div>
          <form action={this.state.returnUrl} method="post" encType="application/x-www-form-urlencoded">
            <table>
              <tbody>
              <tr><td className="ci">lti_message_type</td><td className="ci"><input className="ci" type="text" name="lti_message_type" value="ContentItemSelection" /></td></tr>
              <tr><td className="ci">lti_version</td><td className="ci"><input className="ci" type="text" name="lti_version" value={this.state.ltiVersion} /></td></tr>
              <tr><td className="ci">content_items</td><td className="ci"><textarea className="ci" cols="75" rows="10"  name="content_items" value={items} /></td></tr>
              <tr><td className="ci">data</td><td className="ci"><input className="ci" type="text" name="data" value={this.state.tcData} /></td></tr>
              <tr><td className="ci">oauth_version</td><td className="ci"><input className="ci" type="text" name="oauth_version" defaultValue="1.0" /></td></tr>
              <tr><td className="ci">oauth_nonce</td><td className="ci"><input className="ci" type="text" name="oauth_nonce" value={this.state.oauth_nonce} /></td></tr>
              <tr><td className="ci">oauth_timestamp</td><td className="ci"><input className="ci" type="text" name="oauth_timestamp" value={this.state.oauth_timestamp} /></td></tr>
              <tr><td className="ci">oauth_consumer_key</td><td className="ci"><input className="ci" type="text" name="oauth_consumer_key" value={this.state.consumerKey} /></td></tr>
              <tr><td className="ci">oauth_callback</td><td className="ci"><input className="ci" type="text" name="oauth_callback" value="about:blank" /></td></tr>
              <tr><td className="ci">oauth_signature_method</td><td className="ci"><input className="ci" type="text" name="oauth_signature_method" value={this.state.oauth_signature_method} /></td></tr>
              <tr><td className="ci">oauth_signature</td><td className="ci"><input className="ci" type="text" name="oauth_signature" value={this.state.oauth_signature} /></td></tr>
              </tbody>
            </table>
            <input type="submit" value="Submit" />
          </form>
        </div>

        <div>
          <b>Request body received:</b>
          <DataItemList dataItems={this.state.ciData} />
        </div>
      </div>
    )
  }
}

module.exports =  ContentItemView;
