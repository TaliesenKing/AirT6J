const express = require('express');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, sequelize } = require('../../db/models'); 
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
