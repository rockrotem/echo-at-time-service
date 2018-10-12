const messageService = require('./services/message-service');

let timer = 0;

const MessageScheduler = {
  run(tickPeriod = 1000) {
    console.info(`Waiting for ${tickPeriod} before a new iteration...`);
    timer = setTimeout(async () => {
      console.info('Time is up...');
      const result = await messageService.sendMessages();

      // Finish send messages, send again.
      if (result === 0) {
        this.run();
      }
    }, tickPeriod);
  },
};

module.exports = MessageScheduler;
