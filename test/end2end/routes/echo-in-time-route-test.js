const chai = require('chai');
const chaiHttp = require('chai-http');
const { describe, before, it } = require('mocha');
const bootstrapHelper = require('../../e2e-tools/bootstrap-helper');

chai.use(chaiHttp);
const { expect } = chai;
let app;

describe('echo-in-time route tests', () => {
  before(async () => {
    app = bootstrapHelper.getInstance();
  });

  describe('Save message POST action', () => {
    it('should save message with valid payload', async () => {
      const message = 'test message';
      const runAt = new Date().getTime();
      const response = await chai.request(app).post('/api/v1/save-message')
        .set('content-type', 'application/json')
        .send({
          message,
          runAt,
        });

      const { body } = response;
      expect(response.status, 'HTTP status').to.equal(200);
      expect(body.payload, 'HTTP status').to.eql({ message, runAt });
    });
  });
});
