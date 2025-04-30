import { User } from '@prisma/client';

declare global {
  namespace Express {
    interface Request {
      user?: {
        account?: {
          id: number;
          email: string;
          name: string;
          [key: string]: any;
        };
        profile?: {
          id: number;
          name: string;
          [key: string]: any;
        };
      };
    }
  }
}
