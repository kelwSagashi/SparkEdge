import type { Request } from 'express';

/**
 * Extension of Express Request with authenticated user data.
 * Previously imported from spark-edge-workflow, now self-contained.
 */
export type AuthenticatedRequest<P = {}, Q = {}, B = {}> = Request<P, any, B, Q> & {
  user?: {
    id: string;
    email: string;
    role: string;
  };
};

