const express = require('express');
const { check } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { restoreUser, requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage } = require('../../db/models');
const router = express.Router();


//we need a GET method that returns all spots
router.get('/', async (req, res, next) => {
    //find all spots
    try {
        const spots = await Spot.findAll(); //implementing findall method on the spot model and storing it in a variable
        return res.status(200).json(spots);
    }
    catch (error) {
        next(error)
    }
});

// Get all Spots owned by the Current User
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
                    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgRating']],
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


// Get Spot details by id
router.get('/:id', async (req, res, next) => {
    const { id } = req.params;

    try {
        // Find the spot by its ID, including the SpotImages and Owner associations
        const spot = await Spot.findOne({
            where: { id },
            include: [
                {
                    model: SpotImage,
                    attributes: ['id', 'url', 'preview'],
                },
                {
                    model: User,
                    as: 'Owner',
                    attributes: ['id', 'firstName', 'lastName'],
                },
                {
                    model: Review,
                    attributes: [[sequelize.fn('AVG', sequelize.col('rating')), 'avgStarRating'], [sequelize.fn('COUNT', sequelize.col('id')), 'numReviews']],
                }
            ]
        });

        // If no spot is found, return a 404 error
        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
            });
        }

        // Format the response as per the provided specification
        const spotData = spot.toJSON();
        const spotResponse = {
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
            numReviews: spotData.Reviews.numReviews,
            avgStarRating: spotData.Reviews.avgStarRating,
            SpotImages: spotData.SpotImages.map(image => ({
                id: image.id,
                url: image.url,
                preview: image.preview,
            })),
            Owner: {
                id: spotData.Owner.id,
                firstName: spotData.Owner.firstName,
                lastName: spotData.Owner.lastName,
            },
        };

        return res.status(200).json(spotResponse);
    } catch (error) {
        next(error);
    }
});

// Create a Spot
router.post('/', requireAuth, [
    // Validation for required fields
    check('address')
        .notEmpty()
        .withMessage('Street address is required'),
    check('city')
        .notEmpty()
        .withMessage('City is required'),
    check('state')
        .notEmpty()
        .withMessage('State is required'),
    check('country')
        .notEmpty()
        .withMessage('Country is required'),
    check('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be within -180 and 180'),
    check('name')
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .notEmpty()
        .withMessage('Description is required'),
    check('price')
        .isFloat({ min: 0 })
        .withMessage('Price per day must be a positive number'),
    handleValidationErrors,
], async (req, res, next) => {
    try {
        const { address, city, state, country, lat, lng, name, description, price } = req.body;

        // Create a new Spot
        const newSpot = await Spot.create({
            ownerId: req.user.id,  // Using the current user's ID
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

        // Return the newly created spot details
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

// Add an Image to a Spot based on the Spot's id
router.post('/:spotId/images', requireAuth, async (req, res, next) => {
    const { spotId } = req.params;
    const { url, preview } = req.body;

    try {
        // Find the spot by its id and check if it belongs to the current user
        const spot = await Spot.findByPk(spotId);

        // If the spot doesn't exist, return a 404 error
        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
            });
        }

        // If the current user is not the owner of the spot, return a 403 error
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to add images to this spot",
            });
        }

        // Create the new SpotImage
        const newSpotImage = await SpotImage.create({
            spotId: spot.id,
            url,
            preview,
        });

        // Return the newly created SpotImage
        return res.status(201).json({
            id: newSpotImage.id,
            url: newSpotImage.url,
            preview: newSpotImage.preview,
        });
    } catch (error) {
        next(error);
    }
});

// Edit a Spot
router.put('/:spotId', requireAuth, [
    // Validation for required fields
    check('address')
        .notEmpty()
        .withMessage('Street address is required'),
    check('city')
        .notEmpty()
        .withMessage('City is required'),
    check('state')
        .notEmpty()
        .withMessage('State is required'),
    check('country')
        .notEmpty()
        .withMessage('Country is required'),
    check('lat')
        .isFloat({ min: -90, max: 90 })
        .withMessage('Latitude must be within -90 and 90'),
    check('lng')
        .isFloat({ min: -180, max: 180 })
        .withMessage('Longitude must be within -180 and 180'),
    check('name')
        .isLength({ max: 50 })
        .withMessage('Name must be less than 50 characters'),
    check('description')
        .notEmpty()
        .withMessage('Description is required'),
    check('price')
        .isFloat({ min: 0 })
        .withMessage('Price per day must be a positive number'),
    handleValidationErrors,
], async (req, res, next) => {
    const { spotId } = req.params;
    const { address, city, state, country, lat, lng, name, description, price } = req.body;

    try {
        // Find the spot by its id
        const spot = await Spot.findByPk(spotId);

        // If the spot doesn't exist, return a 404 error
        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
            });
        }

        // If the current user is not the owner of the spot, return a 403 error
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to edit this spot",
            });
        }

        // Update the spot with the new details
        await spot.update({
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

        // Return the updated spot details
        return res.status(200).json({
            id: spot.id,
            ownerId: spot.ownerId,
            address: spot.address,
            city: spot.city,
            state: spot.state,
            country: spot.country,
            lat: spot.lat,
            lng: spot.lng,
            name: spot.name,
            description: spot.description,
            price: spot.price,
            createdAt: spot.createdAt,
            updatedAt: spot.updatedAt,
        });
    } catch (error) {
        next(error);
    }
});

// Delete a Spot
router.delete('/:spotId', requireAuth, async (req, res, next) => {
    const { spotId } = req.params;

    try {
        // Find the spot by its id
        const spot = await Spot.findByPk(spotId);

        // If the spot doesn't exist, return a 404 error
        if (!spot) {
            return res.status(404).json({
                message: "Spot couldn't be found",
            });
        }

        // If the current user is not the owner of the spot, return a 403 error
        if (spot.ownerId !== req.user.id) {
            return res.status(403).json({
                message: "You are not authorized to delete this spot",
            });
        }

        // Delete the spot
        await spot.destroy();

        // Return a success message
        return res.status(200).json({
            message: "Successfully deleted",
        });
    } catch (error) {
        next(error);
    }
});

module.exports = router;