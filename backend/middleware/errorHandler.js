const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
  
    // Mongoose validation error
    if (err.name === 'ValidationError') {
      return res.status(400).json({
        message: 'Validation Error',
        errors: Object.values(err.errors).map(error => ({
          field: error.path,
          message: error.message
        }))
      });
    }
  
    // JWT authentication error
    if (err.name === 'JsonWebTokenError') {
      return res.status(401).json({
        message: 'Invalid token',
        error: err.message
      });
    }
  
    // MongoDB duplicate key error
    if (err.code === 11000) {
      return res.status(409).json({
        message: 'Duplicate Entry',
        error: Object.keys(err.keyValue).map(key => ({
          field: key,
          message: `${key} already exists`
        }))
      });
    }
  
    // Default error
    res.status(500).json({
      message: 'Internal Server Error',
      error: process.env.NODE_ENV === 'development' ? err.message : 'Something went wrong'
    });
  };
  
  module.exports = errorHandler;
  