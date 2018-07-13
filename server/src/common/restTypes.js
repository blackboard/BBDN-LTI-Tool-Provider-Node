export class TCProfileResponse {
  constructor(profile, returnUrl) {
    this.toolConsumerProfile = profile;
    this.launch_presentation_return_url = returnUrl;
  }
}

export class RegistrationData {
  constructor() {
    this.TCProfileResponse = new TCProfileResponse();
    this.status = "";
    this.failReason = "";
  }
}

export class ContentItem {
  constructor() {
    this.data = new Map([]);
    this.consumer_key = "";
    this.consumer_secret = "";
    this.content_items = "";
    this.oauth_nonce = "";
    this.oauth_timestamp = "";
    this.oauth_signature = "";
    this.oauth_signature_method = "";
  }
}

export class JWTPayload {
  constructor() {
    this.header = Object;
    this.body = Object;
    this.verified = false;
    this.return_url = "";
    this.jwt = "";
    this.return_json = "";
  }
}

export class SetupParameters {
  constructor() {
    this.privateKey = "";
    this.tokenEndPoint = "";
    this.issuer = "";
    this.applicationId = "";
    this.devPortalHost = "";
  }
}
