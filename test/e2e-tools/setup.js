const { before, after } = require('mocha');
const dct = require('docker-compose-mocha');

const pathOfDockerCompose = `${__dirname}/docker-compose.yml`;
const { getAddressForService } = dct;

function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

const options = {
  healthCheck: {
    state: true,
    options: {
      custom: {
        db: async () => {
          await sleep(2000);
          return true;
        },
      },
    },
  },
};


const randomEnvName = dct.dockerComposeTool(before, after, pathOfDockerCompose, options);

before(async () => {
  const hosts = await getAddressForService(randomEnvName, pathOfDockerCompose, 'redis', 6379);
  const hostsArray = hosts.split(':');
  /* eslint prefer-destructuring: ["error", {AssignmentExpression: {array: false}}] */
  process.env.REDIS_HOSTS = hosts;
  process.env.REDIS_PORT = hostsArray[1];

  console.info('Redis running');
});
