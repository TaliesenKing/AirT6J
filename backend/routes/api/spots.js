const express = require('express');
const { check, validationResult  } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage, sequelize } = require('../../db/models'); 
const router = express.Router();

// GET all spots
router.get('/', async (req, res, next) => {
    try {
        const spots = await Spot.findAll();  // Fetch all spots
        return res.status(200).json(spots);
    } catch (error) {
        next(error);
    }
});

// GET all spots owned by the current user
router.get('/current', requireAuth, async (req, res, next) => {
    try {
        // Find spots where the ownerId matches the current user's ID
        const spots = await Spot.findAll({
            where: { ownerId: req.user.id },
            include: [
                {
                    model: SpotImage,
                    attributes: ['url'],
                    where: { preview: true },
                    required: false // Include even if there's no preview image
                },
                {
                    model: Review,
                    attributes: [
                        // Change 'rating' to 'stars' here
                        [sequelize.fn('AVG', sequelize.col('stars')), 'avgRating'],
                    ],
                },
            ],
            group: ['Spot.id'],
        });

        // Format response
        const spotsData = spots.map(spot => {
            const spotData = spot.toJSON();
            const previewImage = spot.SpotImages.length > 0 ? spot.SpotImages[0].url : null;
            const avgRating = spot.Reviews.length > 0 ? spot.Reviews[0].dataValues.avgRating : 0;

            return {
                id: spotData.id,
                ownerId: spotData.ownerId,
                address: spotData.address,
                city: spotData.city,
                state: spotData.state,
                country: spotData.country,
                lat: spotData.lat,
                lng: spotData.lng,
                name: spotData.name,
                description: spotData.description,
                price: spotData.price,
                createdAt: spotData.createdAt,
                updatedAt: spotData.updatedAt,
                avgRating: avgRating,
                previewImage: previewImage,
            };
        });

        return res.status(200).json({ Spots: spotsData });
    } catch (error) {
        next(error);
    }
});


//GET a spot by its id
router.get('/:id', async (req, res, next) => {
    try {
        const id = req.params.id; // extract the id number from the endpoint that is put it (for example if endpoint is 1)
        const details = await Spot.findOne({
            where: { id }         // Pass an object with a 'where' clause to find the spot by id . This is how you query for a spot by its id. The where clause specifies the condition to match ths id. 
        }); 

        if (!details) {           // if the spot id does not exist return an error message 
            return res.status(404).json({ message: "Spot couldn't be found" }); 
        }

        return res.status(200).json(details);        // send back the details of the Spot id (our first spot which should be '123 Sunny Beach St' and all its info)
    } catch (error) {
        next(error);
    }
}); 

router.get('/:spotId/reviews', async (req, res) => {
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

// POST a new spot
router.post('/', requireAuth, [
    check('address').notEmpty().withMessage('Street address is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('country').notEmpty().withMessage('Country is required'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
    check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
    check('description').notEmpty().withMessage('Description is required'),
    check('price').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
    handleValidationErrors,
], async (req, res, next) => {
    try {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;
        const newSpot = await Spot.create({
            ownerId: req.user.id,
            address,
            city,
            state,
            country,
            lat,
            lng,
            name,
            description,
            price,
        });

        return res.status(201).json({
            id: newSpot.id,
            ownerId: newSpot.ownerId,
            address: newSpot.address,
            city: newSpot.city,
            state: newSpot.state,
            country: newSpot.country,
            lat: newSpot.lat,
            lng: newSpot.lng,
            name: newSpot.name,
            description: newSpot.description,
            price: newSpot.price,
            createdAt: newSpot.createdAt,
            updatedAt: newSpot.updatedAt,
        });
    } catch (error) {
        next(error);
    }
});

// POST an image to a spot
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
    try {
        const { spotId } = req.params;
        const { url, preview } = req.body;
        const spot = await Spot.findByPk(spotId);

        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
                statusCode: 404
            });
        }

        // Only the spot owner can add images
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({
                message: "Forbidden",
                statusCode: 403
            });
        }

        const newImage = await SpotImage.create({
            spotId: spot.id,
            url,
            preview
        });

        return res.status(200).json({
            id: newImage.id,
            url: newImage.url,
            preview: newImage.preview
        });
    } catch (error) {
        next(error);
    }
});


// PUT edit a Spot
router.put('/:spotId', requireAuth, [
    check('address').notEmpty().withMessage('Street address is required'),
    check('city').notEmpty().withMessage('City is required'),
    check('state').notEmpty().withMessage('State is required'),
    check('country').notEmpty().withMessage('Country is required'),
    check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'),
    check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),
    check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
    check('description').notEmpty().withMessage('Description is required'),
    check('price').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
    handleValidationErrors
  ], async (req, res, next) => {
    try {
      const { spotId } = req.params;
      const userId = req.user.id;
      const spot = await Spot.findByPk(spotId);
  
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }
  
      if (spot.ownerId !== userId) {
        return res.status(403).json({ message: 'Forbidden' });
      }
  
      const {
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
      } = req.body;
  
      await spot.update({
        address,
        city,
        state,
        country,
        lat,
        lng,
        name,
        description,
        price
      });
  
      return res.status(200).json(spot);
    } catch (error) {
      next(error);
    }
  });


  //add a review to a spot based on its id
router.post(
    '/:spotId/reviews',
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
  
    
      console.log('Incoming data:', { spotId, review, stars, userId });

      // Check if there are validation errors
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        console.log('Validation errors:', errors.array());
        return res.status(400).json({
          message: 'Bad Request',
          errors: errors.mapped(),
        });
      }
  
      try {
        // Check if the Spot exists
        const spot = await Spot.findByPk(spotId);
        if (!spot) {
            console.log('Spot not found for id:', spotId);
          return res.status(404).json({ message: "Spot couldn't be found" });
        }
  
        // Check if the user has already reviewed this spot
        const existingReview = await Review.findOne({
          where: { spotId, userId },
        });
        if (existingReview) {
            console.log('User already has a review:', existingReview);
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

        console.log('Review created successfully:', newReview.toJSON());
  
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

// DELETE a spot by ID
router.delete('/:id', requireAuth, async (req, res, next) => {
    try {
      const spotId = req.params.id;
      const spot = await Spot.findByPk(spotId);
  
      if (!spot) {
        return res.status(404).json({ message: "Spot couldn't be found" });
      }
  
      if (spot.ownerId !== req.user.id) {
        return res.status(403).json({ message: "Forbidden" });
      }
  
      await spot.destroy();
  
      return res.status(200).json({ message: "Successfully deleted" });
    } catch (error) {
      next(error);
    }
  });



module.exports = router;
