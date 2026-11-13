import mongoose from 'mongoose';

export function notfound(req, res) {
  res.status(404).json({ error: `cannot ${req.method} ${req.originalUrl}` });
}

export function errorhandler(error, _req, res, _next) {
  if (error instanceof mongoose.Error.ValidationError) {
    return res.status(400).json({
      error: 'validation failed',
      details: Object.values(error.errors).map((issue) => issue.message),
    });
  }

  if (error instanceof mongoose.Error.CastError) {
    return res.status(400).json({ error: `invalid value for ${error.path}` });
  }

  if (error?.code === 11000) {
    return res.status(409).json({ error: 'record already exists', keys: error.keyValue });
  }

  if (error?.status >= 400 && error.status < 600) {
    return res.status(error.status).json({ error: error.message });
  }

  console.error(error);
  return res.status(500).json({ error: 'internal server error' });
}
