declare global {
  namespace Express {
    interface Request {
      hostId?: number;
      validatedQuery?: unknown;
    }
  }
}

export {};
