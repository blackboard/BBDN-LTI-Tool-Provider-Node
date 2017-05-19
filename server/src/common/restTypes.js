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


