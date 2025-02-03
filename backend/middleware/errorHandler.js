const errorHandler = (err, req, res, next) => {
    console.error(err.stack); // Log error details for debugging
  
    const statusCode = res.statusCode !== 200 ? res.statusCode : 500;
    res.status(statusCode).json({
      message: err.message || "Internal Server Error",
      stack: process.env.NODE_ENV === "production" ? null : err.stack,
    });
  };
  
module.exports = errorHandler;
  