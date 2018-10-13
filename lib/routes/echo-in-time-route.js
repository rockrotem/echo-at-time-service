const express = require('express');
const messageService = require('../services/message-service');
const MessageModel = require('../models/message-model');

const router = express.Router();

/* GET home page. */
router.post('/save-message', async (req, res) => {
  const message = req.body;
  const messageModel = new MessageModel(message.message, message.runAt, message.uuid);
  const result = await messageService.scheduleMessage(messageModel);

  res.status(200).json(result);
});

module.exports = router;
