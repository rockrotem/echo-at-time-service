const RedisRepository = require('../repositories/redis-repository');

const MessageService = {
  async scheduleMessage(message) {
    const result = await RedisRepository.scheduleMessage(message);
    return result;
  },

  async processDelayedMessages() {
    return RedisRepository.processDelayedMessages();
  },

  async processMessages() {
    return RedisRepository.processMessages();
  },
};

module.exports = MessageService;
