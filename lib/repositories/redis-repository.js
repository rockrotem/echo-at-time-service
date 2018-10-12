const redis = require('redis');
let client = null;

const RedisRepository = {
  initClient() {
    if (!client) {
      client = redis.createClient();
      client.on('error', (err) => {
        console.error(`Error ${err}`);
      });
    }
  },

  async save(message) {
  },

};

module.exports = RedisRepository;
