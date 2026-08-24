// Centralized error handler. Must be the last middleware registered in app.js.
const errorHandler = (err, req, res, next) => {
  console.error(err.stack);

  if (err.name === 'ValidationError') {
    const messages = Object.values(err.errors).map((e) => e.message);
    return res.status(400).json({ error: 'Validation failed', details: messages });
  }

  if (err.code === 11000) {
    return res.status(409).json({ error: 'A resource with that value already exists.' });
  }

  if (err.name === 'CastError') {
    return res.status(400).json({ error: 'Invalid ID format.' });
  }

  const status = err.status || 500;
  res.status(status).json({ error: err.message || 'Internal server error' });
};

module.exports = errorHandler;
