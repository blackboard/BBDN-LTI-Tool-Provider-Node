export class ContentItem {
  constructor() {
    this.data = new Map([]);
    this.consumer_key = '';
    this.consumer_secret = '';
    this.content_items = '';
    this.oauth_nonce = '';
    this.oauth_timestamp = '';
    this.oauth_signature = '';
    this.oauth_signature_method = '';
  }
}

export class JWTPayload {
  constructor() {
    this.header = Object;
    this.body = Object;
    this.verified = false;
    this.return_url = '';
    this.error_url = '';
    this.jwt = '';
    this.return_json = '';
    this.namesRoles = false;
    this.grading = false;
  }
}
