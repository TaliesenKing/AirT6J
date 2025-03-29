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


module.exports = router;