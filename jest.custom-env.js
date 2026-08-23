const JSDOMEnvironment = require('jest-environment-jsdom').default;

class CustomTestEnvironment extends JSDOMEnvironment {
  async setup() {
    await super.setup();

    // Export Node 20+ Web Standard APIs into JSDOM global context
    this.global.Request = Request;
    this.global.Response = Response;
    this.global.Headers = Headers;
    this.global.fetch = fetch;
    this.global.FormData = FormData;
    this.global.TextEncoder = TextEncoder;
    this.global.TextDecoder = TextDecoder;
    if (typeof ReadableStream !== 'undefined') {
      this.global.ReadableStream = ReadableStream;
    }
    if (typeof TransformStream !== 'undefined') {
      this.global.TransformStream = TransformStream;
    }
  }
}

module.exports = CustomTestEnvironment;
