const chai = require('chai');
const chaiHttp = require('chai-http');
const Chance = require('chance');
const { describe, before, it } = require('mocha');
const MessageModel = require('../../../lib/models/message-model');

chai.use(chaiHttp);
const { expect } = chai;
const chance = new Chance();
let app;

describe('echo-in-time route tests', () => {
  before(async () => {
    const bootstrapHelper = require('../../e2e-tools/bootstrap-helper');
    app = bootstrapHelper.getInstance();
  });

  describe('Save message POST action', () => {
    it('should save 2 messages to delayed queue', async () => {
      let message = chance.sentence({ words: 3 });
      let runAt = new Date();
      runAt.setSeconds(runAt.getSeconds() + 10);
      let messageModel = new MessageModel(message, runAt.getTime());
      let response = await chai.request(app).post('/api/v1/save-message')
        .set('content-type', 'application/json')
        .send(messageModel);

      const { body } = response;
      expect(response.status, 'HTTP status').to.equal(200);
      expect(body, 'body').to.eql({
        message: messageModel,
        ok: true,
      });

      message = chance.sentence({ words: 2 });
      runAt = new Date();
      runAt.setSeconds(runAt.getSeconds() + 60);
      messageModel = new MessageModel(message, runAt.getTime());
      response = await chai.request(app).post('/api/v1/save-message')
        .set('content-type', 'application/json')
        .send(messageModel);

      const body2 = response.body;
      expect(response.status, 'HTTP status').to.equal(200);
      expect(body2, 'body').to.eql({
        message: messageModel,
        ok: true,
      });
    });

    it('should save message to processing queue', async () => {
      const message = chance.sentence({ words: 5 });
      const runAt = new Date();
      runAt.setSeconds(runAt.getSeconds() - 60);
      const messageModel = new MessageModel(message, runAt.getTime());
      const response = await chai.request(app).post('/api/v1/save-message')
        .set('content-type', 'application/json')
        .send(messageModel);

      const { body } = response;
      expect(response.status, 'HTTP status').to.equal(200);
      expect(body, 'body').to.eql({
        message: messageModel,
        ok: true,
      });
    });
  });
});
