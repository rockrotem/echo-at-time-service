const redisRepository = require('../repositories/redis-repository');

const MessageService = {
  async saveMessage(message, useMulti = false) {
    const result = await redisRepository.scheduleMessage(message, useMulti);
    return result;
  },
};

module.exports = MessageService;
