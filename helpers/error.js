const unAuthorized = (res) => {
    res.status(403).json({
      errors: [{ error: "You are not authorized to perform this operation" }],
    });
  };
  
  const unAuthenticated = (res) => {
    res.status(401).json({
      errors: [{ error: "You need to login first" }],
    });
  };
  
  const badRequest = (res, message) => {
    res.status(400).json({
      errors: [{ error: message }],
    });
  };
  
  const notFound = (res, resource) => {
    res.status(404).json({ errors: [{ error: `${resource} not found!` }] });
  };
  
  const formatServerError = (res, message, error) => {
    console.log(message, error);
    res.status(500).json({ errors: [{ error: "Server Error" }] });
  };
  
  class AppError extends Error {
    constructor(statusCode, message, cause, errorCode, isOperational = true) {
      super(message);
  
      this.statusCode = statusCode;
      this.cause = cause instanceof Error ? cause : undefined;
      this.errorCode = errorCode;
      this.isOperational = isOperational;
  
      Error.captureStackTrace(this, this.constructor);
    }
  }
  
  module.exports = {
    unAuthorized,
    unAuthenticated,
    badRequest,
    notFound,
    formatServerError,
    AppError,
  };
  