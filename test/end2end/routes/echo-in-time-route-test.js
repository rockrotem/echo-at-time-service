// require('../../e2e-tools/setup');
const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, before, it } = require('mocha');
const MessageModel = require('../../../lib/models/message-model');

chai.use(chaiHttp);
const { expect } = chai;
let app;

describe('echo-in-time route tests', () => {
  before(async () => {
    const bootstrapHelper = require('../../e2e-tools/bootstrap-helper');
    app = bootstrapHelper.getInstance();
  });

  describe('Save message POST action', () => {
    it('should save message with valid payload', async () => {
      const message = 'test message';
      const runAt = new Date().getTime();
      const messageModel = new MessageModel(message, runAt);
      const response = await chai.request(app).post('/api/v1/save-message')
        .set('content-type', 'application/json')
        .send(messageModel);

      const { body } = response;
      expect(response.status, 'HTTP status').to.equal(200);
      expect(body.ok, 'body.ok').to.equal(true);
    });
  });
});
