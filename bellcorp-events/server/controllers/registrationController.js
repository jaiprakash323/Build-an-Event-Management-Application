const Registration = require('../models/Registration');
const Event = require('../models/Event');
const mongoose = require('mongoose');

// @desc    Register for an event
// @route   POST /api/registrations/:eventId
// @access  Private
const registerForEvent = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Find event
    const event = await Event.findById(eventId).session(session);
    if (!event) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Event not found' });
    }

    // Check if event has already passed
    if (event.date < new Date()) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'Cannot register for a past event' });
    }

    // Check available seats
    if (event.availableSeats <= 0) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'No seats available for this event' });
    }

    // Check if user already registered (active registration)
    const existingRegistration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: 'confirmed',
    }).session(session);

    if (existingRegistration) {
      await session.abortTransaction();
      return res.status(400).json({ message: 'You are already registered for this event' });
    }

    // Check if there's a cancelled registration to reactivate
    const cancelledRegistration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: 'cancelled',
    }).session(session);

    let registration;

    if (cancelledRegistration) {
      // Reactivate cancelled registration
      cancelledRegistration.status = 'confirmed';
      cancelledRegistration.registeredAt = new Date();
      cancelledRegistration.cancelledAt = undefined;
      registration = await cancelledRegistration.save({ session });
    } else {
      // Create new registration
      registration = await Registration.create(
        [{ user: userId, event: eventId, status: 'confirmed' }],
        { session }
      );
      registration = registration[0];
    }

    // Decrement available seats
    event.availableSeats = event.availableSeats - 1;
    await event.save({ session });

    await session.commitTransaction();

    await registration.populate('event');

    res.status(201).json({
      message: 'Successfully registered for event',
      registration,
    });
  } catch (error) {
    await session.abortTransaction();
    console.error('Registration error:', error);
    res.status(500).json({ message: 'Error processing registration' });
  } finally {
    session.endSession();
  }
};

// @desc    Cancel event registration
// @route   DELETE /api/registrations/:eventId
// @access  Private
const cancelRegistration = async (req, res) => {
  const session = await mongoose.startSession();
  session.startTransaction();

  try {
    const { eventId } = req.params;
    const userId = req.user._id;

    // Find registration
    const registration = await Registration.findOne({
      user: userId,
      event: eventId,
      status: 'confirmed',
    }).session(session);

    if (!registration) {
      await session.abortTransaction();
      return res.status(404).json({ message: 'Active registration not found' });
    }

    // Update registration status
    registration.status = 'cancelled';
    registration.cancelledAt = new Date();
    await registration.save({ session });

    // Increment available seats back
    await Event.findByIdAndUpdate(
      eventId,
      { $inc: { availableSeats: 1 } },
      { session }
    );

    await session.commitTransaction();

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    await session.abortTransaction();
    console.error('Cancel registration error:', error);
    res.status(500).json({ message: 'Error cancelling registration' });
  } finally {
    session.endSession();
  }
};

// @desc    Get user's registrations (dashboard)
// @route   GET /api/registrations/my
// @access  Private
const getMyRegistrations = async (req, res) => {
  try {
    const userId = req.user._id;
    const now = new Date();

    const registrations = await Registration.find({
      user: userId,
      status: 'confirmed',
    })
      .populate('event')
      .sort('-registeredAt');

    const upcoming = registrations.filter(
      (r) => r.event && r.event.date >= now
    );
    const past = registrations.filter(
      (r) => r.event && r.event.date < now
    );

    res.json({
      upcoming,
      past,
      total: registrations.length,
    });
  } catch (error) {
    console.error('Get my registrations error:', error);
    res.status(500).json({ message: 'Error fetching registrations' });
  }
};

// @desc    Check if user is registered for an event
// @route   GET /api/registrations/check/:eventId
// @access  Private
const checkRegistration = async (req, res) => {
  try {
    const registration = await Registration.findOne({
      user: req.user._id,
      event: req.params.eventId,
      status: 'confirmed',
    });

    res.json({ isRegistered: !!registration, registration });
  } catch (error) {
    res.status(500).json({ message: 'Error checking registration' });
  }
};

module.exports = {
  registerForEvent,
  cancelRegistration,
  getMyRegistrations,
  checkRegistration,
};
