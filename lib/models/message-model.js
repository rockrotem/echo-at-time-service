const uuid = require('uuid/v4');

class MessageModel {
  constructor(message, runAt) {
    this.message = message;
    this.runAt = runAt;
    this.uuid = uuid();
  }

  static fromString(json) {
    const messageObject = JSON.parse(json);
    Object.assign(this, messageObject);
    return this;
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = MessageModel;
