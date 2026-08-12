/** Generic client-input error — maps to HTTP 400 via apiErrorFromException. */
export class BadRequestError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "BadRequestError";
  }
}

/** Authenticated but wrong role for this endpoint — maps to HTTP 403. */
export class ForbiddenError extends Error {
  constructor(message = "Not allowed for this role") {
    super(message);
    this.name = "ForbiddenError";
  }
}

/** Requested resource doesn't exist (or isn't visible to this user) — maps to HTTP 404. */
export class NotFoundError extends Error {
  constructor(message = "Data tidak ditemukan") {
    super(message);
    this.name = "NotFoundError";
  }
}

/** Action conflicts with current state (e.g. insufficient stock, wrong order status) — maps to HTTP 409. */
export class ConflictError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "ConflictError";
  }
}
