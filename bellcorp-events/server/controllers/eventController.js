const Event = require('../models/Event');
const Registration = require('../models/Registration');

// @desc    Get all events with search, filter, pagination
// @route   GET /api/events
// @access  Public
const getEvents = async (req, res) => {
  try {
    const {
      search,
      category,
      location,
      dateFrom,
      dateTo,
      page = 1,
      limit = 12,
      sort = '-date',
    } = req.query;

    let query = {};

    // Text search across name, organizer, description
    if (search) {
      query.$or = [
        { name: { $regex: search, $options: 'i' } },
        { organizer: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } },
        { location: { $regex: search, $options: 'i' } },
      ];
    }

    // Category filter
    if (category && category !== 'All') {
      query.category = category;
    }

    // Location filter
    if (location && location !== 'All') {
      query.location = { $regex: location, $options: 'i' };
    }

    // Date range filter
    if (dateFrom || dateTo) {
      query.date = {};
      if (dateFrom) query.date.$gte = new Date(dateFrom);
      if (dateTo) query.date.$lte = new Date(dateTo);
    }

    const pageNum = parseInt(page, 10);
    const limitNum = parseInt(limit, 10);
    const skip = (pageNum - 1) * limitNum;

    const [events, total] = await Promise.all([
      Event.find(query).sort(sort).skip(skip).limit(limitNum).lean(),
      Event.countDocuments(query),
    ]);

    const totalPages = Math.ceil(total / limitNum);

    res.json({
      events,
      pagination: {
        current: pageNum,
        total: totalPages,
        totalEvents: total,
        hasNext: pageNum < totalPages,
        hasPrev: pageNum > 1,
      },
    });
  } catch (error) {
    console.error('Get events error:', error);
    res.status(500).json({ message: 'Error fetching events' });
  }
};

// @desc    Get single event by ID
// @route   GET /api/events/:id
// @access  Public
const getEventById = async (req, res) => {
  try {
    const event = await Event.findById(req.params.id);

    if (!event) {
      return res.status(404).json({ message: 'Event not found' });
    }

    res.json(event);
  } catch (error) {
    if (error.kind === 'ObjectId') {
      return res.status(404).json({ message: 'Event not found' });
    }
    res.status(500).json({ message: 'Error fetching event' });
  }
};

// @desc    Get event categories
// @route   GET /api/events/categories
// @access  Public
const getCategories = async (req, res) => {
  try {
    const categories = await Event.distinct('category');
    res.json(categories);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching categories' });
  }
};

// @desc    Get event locations
// @route   GET /api/events/locations
// @access  Public
const getLocations = async (req, res) => {
  try {
    const locations = await Event.distinct('location');
    res.json(locations);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching locations' });
  }
};

// @desc    Get featured events
// @route   GET /api/events/featured
// @access  Public
const getFeaturedEvents = async (req, res) => {
  try {
    const events = await Event.find({ isFeatured: true, date: { $gte: new Date() } })
      .sort('date')
      .limit(6);
    res.json(events);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching featured events' });
  }
};

module.exports = { getEvents, getEventById, getCategories, getLocations, getFeaturedEvents };
