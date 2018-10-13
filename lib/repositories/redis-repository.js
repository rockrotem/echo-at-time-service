/* eslint-disable max-len */
const redis = require('redis');
const Redlock = require('redlock');
const bluebird = require('bluebird');
const MessageModel = require('../models/message-model');

bluebird.promisifyAll(redis);
const { Promise } = bluebird;
const QueueNameDelayed = 'QueueDelayed:';
const QueueName = 'Queue:';
const QueueNameDead = 'QueueDead:';

let client = null;
let redlock = null;

const RedisRepository = {
  initClient() {
    if (!client) {
      client = redis.createClient({ host: 'localhost', port: process.env.REDIS_PORT || 6379 });
      redlock = new Redlock([client]);

      redlock.on('clientError', (err) => {
        console.error('A redis error has occurred:', err);
      });

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

  async scheduleMessage(message) {
    let result;
    const now = Date.now();

    // Run immediate, no delayed.
    if (message.runAt <= now) {
      result = await client.rpush(QueueName, message.toString());
    } else {
      result = await client.zadd(QueueNameDelayed, message.runAt, message.toString());
    }

    return { message, ok: result };
  },

  async processDelayedMessages() {
    const that = this;
    setTimeout(async () => {
      try {
        const now = Date.now();
        // Get first item in delayed queue
        const messages = await client.zrangeAsync(QueueNameDelayed, 0, 0);
        const msg = messages.pop();
        const message = msg ? MessageModel.fromString(msg) : null;

        // No message or it should be processed in future.
        if (!msg || message.runAt > now) {
          console.info('No messages in delayed queue, delay 500 milliseconds and try again');
          await Promise.delay(500);
          return that.processDelayedMessages();
        }

        /** ***********************************************  */
        /** Handle delayed message that should be processed. */
        /** *********************************************** */
        // Minimal lock only for a specific message
        const lock = await redlock.lock(message.uuid, 1000);
        // Delete message from delayed queue.
        const deleted = await client.zrem(QueueNameDelayed, msg);

        // Delete was a success, we should send message to process queue.
        if (deleted) {
          await client.rpush(QueueName, msg);
        }
        lock.unlock();

        console.info('Handle message, delay 500 milliseconds and try again');
        await Promise.delay(500);
        return that.processDelayedMessages();
      } catch (err) {
        console.error('Error processing delayed messages', err);
        await Promise.delay(500);
        return that.processDelayedMessages();
      }
    }, 500);
  },

  async processMessages() {
    const that = this;
    setTimeout(async () => {
      try {
        // Get message and move to dead queue for Reliability.
        const msg = await client.rpoplpushAsync(QueueName, QueueNameDead);
        const message = msg ? MessageModel.fromString(msg) : null;

        if (message) {
          console.info('message was: ', message.message);

          // Delete from dead queue after success.
          const deleted = await client.lremAsync(QueueNameDead, 0, msg);
          console.info('Deleted message from dead queue status: ', deleted);
        }

        await Promise.delay(500);
        return that.processMessages();
      } catch (err) {
        console.error('Error processing messages', err);
        await Promise.delay(500);
        return that.processMessages();
      }
    }, 500);
  },
};

module.exports = RedisRepository;
