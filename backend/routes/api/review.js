const express = require('express');
const bcrypt = require('bcryptjs');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { setTokenCookie, requireAuth } = require('../../utils/auth');
const { User } = require('../../db/models');
const router = express.Router();
//#1 we need a GET request that returns all reviews by current user

router.get('/reviews', requireAuth, async (req, res) => {
  try {
    const userId = req.user.id; // Get the current user's ID from the authentication token

    // Fetch all reviews by the current user with associated Spot, User, and ReviewImages
    const reviews = await Review.findAll({
      where: { userId },
      include: [
        {
          model: User,
          attributes: ['id', 'firstName', 'lastName'], // Include the User's first name and last name
        },
        {
          model: Spot,
          attributes: ['id', 'ownerId', 'address', 'city', 'state', 'country', 'lat', 'lng', 'name', 'price', 'previewImage'], // Include Spot details
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
        previewImage: review.Spot.previewImage,
      },
      ReviewImages: review.ReviewImages.map(image => ({
        id: image.id,
        url: image.url,
      })),
    }));

    // Send the response
    return res.status(200).json({ Reviews: reviewsResponse });
  } catch (error) {
    console.error('Error fetching reviews:', error);
    return res.status(500).json({ message: 'Internal Server Error' });
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
 
//#3 We need to create a review for a spot based on the spot's id
router.post(
    '/spots/:spotId/reviews',
    requireAuth, // Middleware to ensure user is authenticated
    [
      // Validation checks
      check('review')
        .notEmpty()
        .withMessage('Review text is required')
        .isLength({ max: 500 })
        .withMessage('Review text must be less than 500 characters'),
      check('stars')
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    ],
    async (req, res) => {
      const { spotId } = req.params;
      const { review, stars } = req.body;
      const userId = req.user.id; // Get the current user's ID from the authentication token
  
      // Check if there are validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Bad Request',
          errors: errors.mapped(),
        });
      }
  
      try {
        // Check if the Spot exists
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
          return res.status(404).json({ message: "Spot couldn't be found" });
        }
  
        // Check if the user has already reviewed this spot
        const existingReview = await Review.findOne({
          where: { spotId, userId },
        });
        if (existingReview) {
          return res.status(500).json({
            message: 'User already has a review for this spot',
          });
        }
  
        // Create the new review
        const newReview = await Review.create({
          userId,
          spotId,
          review,
          stars,
        });
  
        // Return the newly created review
        return res.status(201).json({
          id: newReview.id,
          userId: newReview.userId,
          spotId: newReview.spotId,
          review: newReview.review,
          stars: newReview.stars,
          createdAt: newReview.createdAt,
          updatedAt: newReview.updatedAt,
        });
      } catch (error) {
        console.error('Error creating review:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );


//#4 We need to add an image to a review based on the review's ID
router.post(
    '/reviews/:reviewId/images',
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
router.put(
    '/reviews/:reviewId',
    requireAuth, // Ensure the user is authenticated
    [
      // Validation checks
      check('review')
        .notEmpty()
        .withMessage('Review text is required')
        .isLength({ max: 500 })
        .withMessage('Review text must be less than 500 characters'),
      check('stars')
        .isInt({ min: 1, max: 5 })
        .withMessage('Stars must be an integer from 1 to 5'),
    ],
    async (req, res) => {
      const { reviewId } = req.params;
      const { review, stars } = req.body;
      const userId = req.user.id; // Get the current user's ID from the authentication token
  
      // Check if the request body is valid
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({
          message: 'Bad Request',
          errors: errors.mapped(),
        });
      }
  
      try {
        // Check if the review exists
        const existingReview = await Review.findByPk(reviewId);
        if (!existingReview) {
          return res.status(404).json({ message: "Review couldn't be found" });
        }
  
        // Check if the review belongs to the current user
        if (existingReview.userId !== userId) {
          return res.status(403).json({ message: 'You are not authorized to edit this review' });
        }
  
        // Update the review
        existingReview.review = review;
        existingReview.stars = stars;
        await existingReview.save();
  
        // Return the updated review
        return res.status(200).json({
          id: existingReview.id,
          userId: existingReview.userId,
          spotId: existingReview.spotId,
          review: existingReview.review,
          stars: existingReview.stars,
          createdAt: existingReview.createdAt,
          updatedAt: existingReview.updatedAt,
        });
      } catch (error) {
        console.error('Error updating review:', error);
        return res.status(500).json({ message: 'Internal Server Error' });
      }
    }
  );


  //#6 last one this one deletes a review
  router.delete('/reviews/:reviewId', requireAuth, async (req, res) => {
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