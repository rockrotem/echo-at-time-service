const redis = require('redis');
const bluebird = require('bluebird');

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

};

module.exports = RedisRepository;
