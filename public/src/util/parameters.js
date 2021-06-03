export default class parameters {
  static #instance;
  #nonce = '';
  #courseId = '';

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

  getCourseId() {
    return this.#courseId;
  }

  setCourseId(courseId) {
    this.#courseId = courseId;
  }
}
