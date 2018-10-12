/* eslint-disable max-len */
const redis = require('redis');
const bluebird = require('bluebird');
const MessageModel = require('../models/message-model');

bluebird.promisifyAll(redis);
const QueueNameDelayed = 'QueueNameDelayed';

let client = null;

const RedisRepository = {
  initClient() {
    if (!client) {
      client = redis.createClient({ host: 'localhost', port: process.env.REDIS_PORT || 6379 });
      client.on('error', (err) => {
        console.error(`Error ${err}`);
      });

      client.on('connect', () => {
        console.info('Connect to redis');
      });

      client.on('ready', () => {
        console.info('Redis client ready!');
      });
    }
  },

  async scheduleMessage(message, useMulti = false) {
    let result;

    if (useMulti) {
      result = await client.multi.zadd(QueueNameDelayed, message.runAt, message.toString());
    } else {
      result = await client.zadd(QueueNameDelayed, message.runAt, message.toString());
    }

    return result;
  },

  async processNextMessages() {
    const now = Date.now();
    const process = async (messages) => {
      if (messages.length) {
        const msg = messages.pop();
        const message = MessageModel.fromString(msg);
        if (message.runAt > now) {
          console.warn(`process message with future date for message runAt: ${new Date(message.runAt).toISOString()} for date: ${new Date(now).toISOString()}`);
        }

        const multi = client.multi();
        // dispatcher.enqueue(message, multi);
        const deleted = await multi.zrem(QueueNameDelayed, msg);
        console.info('Delete message', deleted);

        const result = await multi.exec();
        console.info('multi.exec result', result);
        return process(messages);
      }

      console.info('No more messages');
      return 0;
    };

    const messages = await client.zrangebyscore(QueueNameDelayed, 0, now, async (err, resultMessages) => {
      if (err) {
        console.error('error on zrangebyscore', err);
      }
      return process(resultMessages);
    });
    return process(messages);
  },
};

module.exports = RedisRepository;
