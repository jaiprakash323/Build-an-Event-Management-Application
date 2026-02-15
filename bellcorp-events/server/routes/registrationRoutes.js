const express = require('express');
const router = express.Router();
const {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  checkRegistration,
} = require('../controllers/registrationController');
const { protect } = require('../middleware/authMiddleware');

// All routes are protected
router.use(protect);

router.get('/my', getMyRegistrations);
router.get('/check/:eventId', checkRegistration);
router.post('/:eventId', registerForEvent);
router.delete('/:eventId', cancelRegistration);

module.exports = router;
