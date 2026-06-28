declare global {
  namespace Express {
    interface Request {
      hostId?: number;
    }
  }
}

export {};
