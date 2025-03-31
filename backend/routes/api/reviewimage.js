const express = require('express');
const router = express.Router();
const { ReviewImage } = require('../../db/models');

// Route to get all images related to a specific review
router.get('/:reviewId', async (req, res, next) => {
  try {
    const reviewId = req.params.reviewId;
    const reviewImages = await ReviewImage.findAll({
      where: { reviewId }
    });
    
    if (!reviewImages.length) {
      return res.status(404).json({ message: 'No images found for this review.' });
    }

    res.json({ reviewImages });
  } catch (err) {
    next(err);
  }
});

// Route to create a new review image
router.post('/', async (req, res, next) => {
  try {
    const { reviewId, imageUrl } = req.body;

    if (!reviewId || !imageUrl) {
      return res.status(400).json({ message: 'Review ID and image URL are required.' });
    }

    const reviewImage = await ReviewImage.create({
      reviewId,
      imageUrl
    });

    res.status(201).json({ reviewImage });
  } catch (err) {
    next(err);
  }
});

// Route to delete a review image
router.delete('/:id', async (req, res, next) => {
  try {
    const reviewImageId = req.params.id;
    const reviewImage = await ReviewImage.findByPk(reviewImageId);

    if (!reviewImage) {
      return res.status(404).json({ message: 'Review image not found.' });
    }

    await reviewImage.destroy();
    res.status(200).json({ message: 'Review image deleted successfully.' });
  } catch (err) {
    next(err);
  }
});

module.exports = router;