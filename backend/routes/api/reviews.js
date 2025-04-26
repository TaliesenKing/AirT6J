const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const { Review, Spot, ReviewImage } = require('../../db/models');
const router = express.Router();


//#1 we need a GET request that returns all reviews by current user
router.get('/current', requireAuth, async (req, res) => {
  const userId = req.user.id;

  try {
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'], // keep only necessary fields
        },
        {
          model: Spot,
          attributes: [
            'id',
            'ownerId',
            'address',
            'city',
            'state',
            'country',
            'lat',
            'lng',
            'name',
            'price',
          ], // keep only necessary fields
        },
        {
          model: ReviewImage,
          where: { preview: true }, // to filter out only the preview image
          attributes: ['url'], // get only the URL of the preview image
        },
      ],
    });

    // Format the response
    const formattedReviews = reviews.map(review => {
      // Extract the preview image URL
      const previewImage = review.ReviewImages.length > 0 ? review.ReviewImages[0].url : null;

      return {
        id: review.id,
        userId: review.userId,
        spotId: review.spotId,
        review: review.review,
        stars: review.stars,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        User: {
          id: review.User.id,
          firstName: review.User.firstName,
          lastName: review.User.lastName,
        },
        Spot: {
          id: review.Spot.id,
          ownerId: review.Spot.ownerId,
          address: review.Spot.address,
          city: review.Spot.city,
          state: review.Spot.state,
          country: review.Spot.country,
          lat: review.Spot.lat,
          lng: review.Spot.lng,
          name: review.Spot.name,
          price: review.Spot.price,
          previewImage, // Add the previewImage here
        },
        ReviewImages: review.ReviewImages.map(img => ({
          id: img.id,
          url: img.url,
        })),
      };
    });

    return res.status(200).json({ Reviews: formattedReviews });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: 'Something went wrong' });
  }
});

//#2 next we  need to get all reviews by a spot's id
router.get('/spots/:spotId/reviews', async (req, res) => {
    const { spotId } = req.params; // Get the spotId from the route parameters
  
    try {
      // Check if the Spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        // If the spot doesn't exist, return a 404 error
        return res.status(404).json({ message: "Spot couldn't be found" });
      }
  
      // Fetch all reviews associated with the spotId
      const reviews = await Review.findAll({
        where: { spotId },
        include: [
          {
            model: User,
            attributes: ['id', 'firstName', 'lastName'], // Include the User's first name and last name
          },
          {
            model: ReviewImage,
            attributes: ['id', 'url'], // Include ReviewImages
          },
        ],
      });
  
      // Map through the reviews and format the data as required by the response
      const reviewsResponse = reviews.map(review => ({
        id: review.id,
        userId: review.userId,
        spotId: review.spotId,
        review: review.review,
        stars: review.stars,
        createdAt: review.createdAt,
        updatedAt: review.updatedAt,
        User: {
          id: review.User.id,
          firstName: review.User.firstName,
          lastName: review.User.lastName,
        },
        ReviewImages: review.ReviewImages.map(image => ({
          id: image.id,
          url: image.url,
        })),
      }));
  
      // Send the response
      return res.status(200).json({ Reviews: reviewsResponse });
    } catch (error) {
      console.error('Error fetching reviews for spot:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });
 

  //create a review
  router.post('/spots/:spotId/reviews', requireAuth, async (req, res) => {
    const { spotId } = req.params;
    const { review, stars } = req.body;
    const userId = req.user.id; // Get the current user's ID from the authentication token
  
    // Validation
    if (!review || typeof review !== 'string' || review.trim().length < 1) {
      return res.status(400).json({ message: 'Review text is required' });
    }
    if (!stars || stars < 1 || stars > 5) {
      return res.status(400).json({ message: 'Stars must be between 1 and 5' });
    }
  
    try {
      // Check if the spot exists
      const spot = await Spot.findByPk(spotId);
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }
  
      // Check if the user already reviewed this spot
      const existingReview = await Review.findOne({ where: { userId, spotId } });
      if (existingReview) {
        return res.status(500).json({ message: 'User already has a review for this spot' });
      }
  
      // Create the new review
      const newReview = await Review.create({
        userId,
        spotId,
        review,
        stars,
      });
  
      // Return the created review
      return res.status(201).json(newReview);
    } catch (error) {
      console.error('Error creating review:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

//#4 We need to add an image to a review based on the review's ID
router.post(
    '/:reviewId/images',
    requireAuth, // Middleware to ensure user is authenticated
    async (req, res) => {
      const { reviewId } = req.params;
      const { url } = req.body;
      const userId = req.user.id; // Get the current user's ID from the authentication token
  
      try {
        // Check if the review exists
        const review = await Review.findByPk(reviewId);
        if (!review) {
          return res.status(404).json({ message: "Review couldn't be found" });
        }
  
        // Check if the review belongs to the current user
        if (review.userId !== userId) {
          return res.status(403).json({ message: "You are not authorized to add an image to this review" });
        }
  
        // Check the current number of images for this review
        const currentImages = await ReviewImage.count({
          where: { reviewId },
        });
  
        if (currentImages >= 10) {
          return res.status(403).json({
            message: 'Maximum number of images for this resource was reached',
          });
        }
  
        // Add the new image to the review
        const newImage = await ReviewImage.create({
          reviewId,
          url,
        });
  
        // Return the newly created image
        return res.status(201).json({
          id: newImage.id,
          url: newImage.url,
        });
      } catch (error) {
        console.error('Error adding image to review:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );

//#5 next route needs to Edit a Review
router.put('/:reviewId', requireAuth, async (req, res) => {
  const { reviewId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  // Validate input
  const errors = {};
  if (!review) errors.review = "Review text is required";
  if (!Number.isInteger(stars) || stars < 1 || stars > 5)
    errors.stars = "Stars must be an integer from 1 to 5";

  if (Object.keys(errors).length) {
    return res.status(400).json({
      message: "Bad Request",
      errors,
    });
  }

  try {
    const existingReview = await Review.findByPk(reviewId);

    if (!existingReview) {
      return res.status(404).json({ message: "Review couldn't be found" });
    }

    if (existingReview.userId !== userId) {
      return res.status(403).json({ message: "Forbidden" });
    }

    existingReview.review = review;
    existingReview.stars = stars;
    await existingReview.save();

    return res.status(200).json(existingReview);
  } catch (err) {
    console.error('Error updating review:', err);
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});


  //#6 last one this one deletes a review
  router.delete('/:reviewId', requireAuth, async (req, res) => {
    const { reviewId } = req.params;
    const userId = req.user.id; // Get the current user's ID from the authentication token
  
    try {
      // Check if the review exists
      const review = await Review.findByPk(reviewId);
      if (!review) {
        return res.status(404).json({ message: "Review couldn't be found" });
      }
  
      // Check if the review belongs to the current user
      if (review.userId !== userId) {
        return res.status(403).json({ message: 'You are not authorized to delete this review' });
      }
  
      // Delete the review
      await review.destroy();
  
      // Return a success message
      return res.status(200).json({ message: 'Successfully deleted' });
    } catch (error) {
      console.error('Error deleting review:', error);
      return res.status(500).json({ message: 'Internal Server Error' });
    }
  });

module.exports = router;