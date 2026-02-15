const express = require('express');
const router = express.Router();
const {
  getEvents,
  getEventById,
  getCategories,
  getLocations,
  getFeaturedEvents,
} = require('../controllers/eventController');

router.get('/', getEvents);
router.get('/featured', getFeaturedEvents);
router.get('/categories', getCategories);
router.get('/locations', getLocations);
router.get('/:id', getEventById);

module.exports = router;
