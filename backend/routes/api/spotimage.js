const express = require('express');
const router = express.Router();
const { SpotImage, Spot, sequelize } = require('../../db/models'); 
const { requireAuth } = require('../../utils/auth'); 

// DELETE a spot image
router.delete('/:imageId', requireAuth, async (req, res, next) => {
  try {
    const { imageId } = req.params;
    const image = await SpotImage.findByPk(imageId);

    if (!image) {
      return res.status(404).json({
        message: "Spot Image couldn't be found"
      });
    }

    const spot = await Spot.findByPk(image.spotId);

    if (!spot) {
      return res.status(404).json({
        message: "Associated Spot couldn't be found"
      });
    }

    if (spot.ownerId !== req.user.id) {
      return res.status(403).json({ message: "Forbidden" });
    }

    await image.destroy();

    return res.json({
      message: "Successfully deleted"
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;