export class parameters {
  static #instance;
  #nonce = '';

  static getInstance() {
    if (!this.#instance) {
      this.#instance = new parameters();
    }
    return this.#instance;
  }

  getNonce() {
    return this.#nonce;
  }

  setNonce(nonce) {
    this.#nonce = nonce;
  }
}
