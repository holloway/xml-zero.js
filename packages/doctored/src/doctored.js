export const defaultOptions = {
  workerUrl: "./worker.js"
};

export default class Doctored {
  constructor(options) {
    this.options = {
      ...defaultOptions,
      ...options
    };

    this.worker = new Worker(this.options.workerUrl);
  }
}
