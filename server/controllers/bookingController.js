import Booking from '../models/Booking.js';

// @desc    Create a new booking
// @route   POST /api/bookings
// @access  Private
export const createBooking = async (req, res) => {
  try {
    const newBooking = new Booking(req.body);
    await newBooking.save();
    res.status(201).json(newBooking);
  } catch (error) {
    console.error('Error creating booking:', error);
    res.status(500).json({ message: 'Server error while creating booking.' });
  }
};

// @desc    Get all bookings (for admin)
// @route   GET /api/bookings
// @access  Private/Admin
export const getAllBookings = async (req, res) => {
  try {
    // Populate 'userId' to get user details, sorting by most recent
    const bookings = await Booking.find().populate('userId', 'name email').sort({ createdAt: -1 });
    res.status(200).json(bookings);
  } catch (error) {
    console.error('Error fetching bookings:', error);
    res.status(500).json({ message: 'Server error while fetching bookings.' });
  }
};

// @desc    Get a single booking by PNR
// @route   GET /api/bookings/pnr/:pnr
// @access  Private
export const getBookingByPnr = async (req, res) => {
  try {
    // Guard against missing param
    const rawPnr = req.params && req.params.pnr ? req.params.pnr : '';
    const pnrToSearch = String(rawPnr).trim();
    if (!pnrToSearch) {
      return res.status(400).json({ message: 'PNR is required' });
    }
    const booking = await Booking.findOne({ pnrNumber: { $regex: `^${pnrToSearch}$`, $options: 'i' } }).populate('userId', 'name email');
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error fetching booking by PNR:', error);
    res.status(500).json({ message: 'Server error while fetching booking.' });
  }
};

// @desc    Update a booking
// @route   PUT /api/bookings/:id
// @access  Private
export const updateBooking = async (req, res) => {
  try {
    const booking = await Booking.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }
    res.status(200).json(booking);
  } catch (error) {
    console.error('Error updating booking:', error);
    res.status(500).json({ message: 'Server error while updating booking.' });
  }
};