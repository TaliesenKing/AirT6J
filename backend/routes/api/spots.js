const express = require('express');
const { check, validationResult } = require('express-validator');
const { handleValidationErrors } = require('../../utils/validation');
const { requireAuth } = require('../../utils/auth');
const { User, Spot, SpotImage, Review, ReviewImage, sequelize } = require('../../db/models');
const router = express.Router();
const { Op } = require('sequelize');


const validateQueryParam = (value, rules) => {
  if (value === undefined) return null;
  const numValue = !isNaN(value) ? Number(value) : value;
  if (rules.isNumeric && isNaN(numValue)) return rules.invalidMsg || 'Must be a number';
  if (rules.min !== undefined && numValue < rules.min) return rules.minMsg || `Must be at least ${rules.min}`;
  if (rules.max !== undefined && numValue > rules.max) return rules.maxMsg || `Must be at most ${rules.max}`;
  return null;
};

// GET all spots with optional filters
router.get('/', async (req, res, next) => {
  try {
    let { page = 1, size = 20, minLat, maxLat, minLng, maxLng, minPrice, maxPrice } = req.query;
    page = Number(page);
    size = Number(size);

    const errors = {};
    const queryParamValidations = {
      page: { min: 1, max: 10, invalidMsg: 'Page must be a number between 1 and 10' },
      size: { min: 1, max: 20, invalidMsg: 'Size must be a number between 1 and 20' },
      minLat: { invalidMsg: "Minimum latitude is invalid" },
      maxLat: { invalidMsg: "Maximum latitude is invalid" },
      minLng: { invalidMsg: "Minimum longitude is invalid" },
      maxLng: { invalidMsg: "Maximum longitude is invalid" },
      minPrice: { min: 0, minMsg: "Minimum price must be >= 0", invalidMsg: "Minimum price must be a number" },
      maxPrice: { min: 0, minMsg: "Maximum price must be >= 0", invalidMsg: "Maximum price must be a number" }
    };

    for (const [param, rules] of Object.entries(queryParamValidations)) {
      const error = validateQueryParam(req.query[param], rules);
      if (error) errors[param] = error;
    }

    if (Object.keys(errors).length) {
      return res.status(400).json({ message: "Bad Request", errors });
    }

    const where = {};
    if (minLat !== undefined) where.lat = { [Op.gte]: Number(minLat) };
    if (maxLat !== undefined) where.lat = { ...where.lat, [Op.lte]: Number(maxLat) };
    if (minLng !== undefined) where.lng = { [Op.gte]: Number(minLng) };
    if (maxLng !== undefined) where.lng = { ...where.lng, [Op.lte]: Number(maxLng) };
    if (minPrice !== undefined) where.price = { [Op.gte]: Number(minPrice) };
    if (maxPrice !== undefined) where.price = { ...where.price, [Op.lte]: Number(maxPrice) };

    const spots = await Spot.findAll({
      include: [
        {
          model: SpotImage,
          attributes: ['url'],
          where: { preview: true },
          required: false
        },
        {
          model: Review,
          attributes: []
        }
      ],
      attributes: {
        include: [
          [
            sequelize.fn("AVG", sequelize.col("Reviews.stars")),
            "avgRating"
          ]
        ]
      },
      group: ['Spot.id', 'SpotImages.id']
    });

    const formatted = spots.map(spot => {
      const spotData = spot.toJSON();
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
        avgRating: spotData.avgRating ? Number(spotData.avgRating).toFixed(1) : null,
        previewImage: spotData.SpotImages?.[0]?.url || null
      };
    });

    return res.status(200).json({ Spots: formatted });
  } catch (error) {
    next(error);
  }
});

// GET current user's spots
router.get('/current', requireAuth, async (req, res, next) => {
  try {
    const spots = await Spot.findAll({
      where: { ownerId: req.user.id },
      include: [
        {
          model: SpotImage,
          attributes: ['url', 'preview'],
          where: { preview: true },
          required: false
        },
        {
          model: Review,
          attributes: []
        }
      ],
      attributes: {
        include: [
          [sequelize.fn("AVG", sequelize.col("Reviews.stars")), "avgRating"]
        ]
      },
      group: ['Spot.id', 'SpotImages.id']
    });

    const formatted = spots.map(spot => {
      const spotData = spot.toJSON();
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
        avgRating: Number(spotData.avgRating || 0).toFixed(1),
        previewImage: spotData.SpotImages?.[0]?.url || null
      };
    });

    return res.status(200).json({ Spots: formatted });
  } catch (error) {
    next(error);
  }
});

// GET a spot by ID
router.get('/:id', async (req, res) => {
  const { id } = req.params;

  try {
    console.log('Fetching spot with ID:', id);

    const spot = await Spot.findByPk(id, {
      include: [
        {
          model: SpotImage,
          attributes: ['id', 'url', 'preview']
        }
      ]
    });

    if (!spot) {
      return res.status(404).json({ message: 'Spot not found' });
    }

    // Get average star rating from reviews
    const reviews = await Review.findAll({
      where: { spotId: id },
      attributes: ['stars']
    });

    const totalStars = reviews.reduce((sum, r) => sum + r.stars, 0);
    const avgStarRating = reviews.length ? (totalStars / reviews.length).toFixed(2) : null;

    // Prepare response object
    const spotData = spot.toJSON();

    // Add previewImage field if any preview image exists
    const preview = spotData.SpotImages.find(img => img.preview);
    spotData.previewImage = preview ? preview.url : null;

    spotData.avgStarRating = avgStarRating;

    res.json(spotData);

  } catch (err) {
    console.error('🔥 Error fetching spot:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// GET reviews for a spot
router.get('/:spotId/reviews', async (req, res) => {
  const { spotId } = req.params;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const reviews = await Review.findAll({
      where: { spotId },
      include: [
        { model: User, attributes: ['id', 'firstName', 'lastName'] },
        { model: ReviewImage, attributes: ['id', 'url'] }
      ]
    });

    const formatted = reviews.map(review => ({
      id: review.id,
      userId: review.userId,
      spotId: review.spotId,
      review: review.review,
      stars: review.stars,
      createdAt: review.createdAt,
      updatedAt: review.updatedAt,
      User: review.User,
      ReviewImages: review.ReviewImages
    }));

    return res.status(200).json({ Reviews: formatted });
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// POST a new spot
router.post('/', requireAuth, [
  check('address').notEmpty().withMessage('Street address is required'),
  check('city').notEmpty().withMessage('City is required'),
  check('state').notEmpty().withMessage('State is required'),
  check('country').notEmpty().withMessage('Country is required'),
  //check('lat').isFloat({ min: -90, max: 90 }).withMessage('Latitude must be within -90 and 90'), optional for mvp
  //check('lng').isFloat({ min: -180, max: 180 }).withMessage('Longitude must be within -180 and 180'),optional for mvp
  check('name').isLength({ max: 50 }).withMessage('Name must be less than 50 characters'),
  check('description').notEmpty().withMessage('Description is required'),
  check('price').isFloat({ min: 0 }).withMessage('Price per day must be a positive number'),
  handleValidationErrors
], async (req, res, next) => {
  try {
    const newSpot = await Spot.create({
      ...req.body,
      ownerId: req.user.id
    });

    return res.status(201).json(newSpot);
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

    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    const newImage = await SpotImage.create({ spotId, url, preview });
    return res.status(200).json({ id: newImage.id, url: newImage.url, preview: newImage.preview });
  } catch (error) {
    next(error);
  }
});

// PUT update a spot
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
    const spot = await Spot.findByPk(req.params.spotId);
    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: 'Forbidden' });

    await spot.update(req.body);
    return res.status(200).json(spot);
  } catch (error) {
    next(error);
  }
});

// POST a review to a spot
router.post('/:spotId/reviews', requireAuth, [
  check('review').notEmpty().withMessage('Review text is required'),
  check('stars').isInt({ min: 1, max: 5 }).withMessage('Stars must be an integer from 1 to 5'),
  handleValidationErrors
], async (req, res) => {
  const { spotId } = req.params;
  const { review, stars } = req.body;
  const userId = req.user.id;

  try {
    const spot = await Spot.findByPk(spotId);
    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });

    const existingReview = await Review.findOne({ where: { spotId, userId } });
    if (existingReview) return res.status(403).json({ message: 'User already has a review for this spot' });

    const newReview = await Review.create({ userId, spotId, review, stars });
    return res.status(201).json(newReview);
  } catch (error) {
    return res.status(500).json({ message: 'Internal Server Error' });
  }
});

// DELETE a spot by ID
router.delete('/:id', requireAuth, async (req, res, next) => {
  try {
    const spot = await Spot.findByPk(req.params.id);
    if (!spot) return res.status(404).json({ message: "Spot couldn't be found" });
    if (spot.ownerId !== req.user.id) return res.status(403).json({ message: "Forbidden" });

    await spot.destroy();
    return res.status(200).json({ message: "Successfully deleted" });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
