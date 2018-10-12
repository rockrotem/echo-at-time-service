class MessageModel {
  constructor(message, runAt) {
    this.message = message;
    this.runAt = runAt;
  }

  static fromString(json) {
    const messageObject = JSON.parse(json);
    Object.assign(this, messageObject);
  }

  toString() {
    return JSON.stringify(this);
  }
}

module.exports = MessageModel;
