const express = require('express');

const router = express.Router();

/* GET home page. */
router.post('/save-message', (req, res) => {
  const message = req.body;
  console.info('rotem', message);
  res.status(200).json({ ok: true, payload: message });
});

module.exports = router;
