const express = require('express');
const router = express.Router();

// Example route for creating a spot image
router.post('/', (req, res) => {
  res.send('Create a new spot image');
});

// Example route for getting a spot image
router.get('/:id', (req, res) => {
  res.send(`Get spot image with id: ${req.params.id}`);
});

module.exports = router;