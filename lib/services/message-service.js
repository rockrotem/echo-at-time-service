const RedisRepository = require('../repositories/redis-repository');

const MessageService = {
  async saveMessage(message, useMulti = false) {
    const result = await RedisRepository.scheduleMessage(message, useMulti);
    return result;
  },

  async sendMessages() {
    return RedisRepository.processNextMessages();
  },
};

module.exports = MessageService;
