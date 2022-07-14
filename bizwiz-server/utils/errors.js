class ExpressError extends Error {
  constructor(message, status) {
    super();
    this.message = message;
    this.status = status;
  }
}

class BadRequestError extends ExpressError {
  constructor(message) {
    super("Bad Request", 400);
    this.message = message ? message : "Bad Request";
  }
}

class NotFoundError extends ExpressError {
  constructor(message) {
    super("Not Found", 404);
    this.message = message ? message : "Not Found";
  }
}

class ForbiddenError extends ExpressError {
  constructor(message) {
    super("Forbidden", 403);
    this.message = message ? message : "Forbidden";
  }
}

module.exports = {
  ExpressError,
  BadRequestError,
  NotFoundError,
  ForbiddenError,
};
