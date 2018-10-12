const app = require('../../bin/www');

module.exports = (() => {
  const helper = {};

  helper.getInstance = function getInstance() {
    return app;
  };
  return helper;
})();
