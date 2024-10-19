// ./types.d.ts

declare namespace Express {
  export interface Request {
    user?: {
      id: string;
      username: string;
      decentraland_name: string;
      decentraland_profile: any;
      dharma_points: number;
      karma_points: number;
      created_at: string;
      avatar_url?: string;
      last_calculation?: number;
    };
  }
}
