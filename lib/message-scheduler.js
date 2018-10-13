const messageService = require('./services/message-service');


const MessageScheduler = {
  run() {
    messageService.processDelayedMessages();
    messageService.processMessages();
    // TODO: Add schedule for DeadQueue
  },
};

module.exports = MessageScheduler;
