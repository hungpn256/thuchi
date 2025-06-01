export interface Savings {
  id: number;
  name: string;
  amount: number;
  assetType: string;
  unit: string;
  description?: string;
  color?: string;
  profileId: number;
  createdById: number;
  createdAt: string;
  updatedAt: string;
  profile?: {
    id: number;
    name: string;
  };
  createdBy?: {
    id: number;
    email: string;
  };
}

export interface CreateSavingsDTO {
  name: string;
  amount: number;
  assetType?: string;
  unit?: string;
  description?: string;
  color?: string;
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface UpdateSavingsDTO {
  name?: string;
  amount?: number;
  assetType?: string;
  unit?: string;
  description?: string;
  color?: string;
}

export interface GetSavingsParams {
  page?: number;
  limit?: number;
  search?: string;
  assetType?: string;
  sortBy?: 'name' | 'amount' | 'createdAt';
  sortOrder?: 'asc' | 'desc';
}

export interface PaginatedSavingsResult {
  data: Savings[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface SavingsTotal {
  byAssetType: {
    assetType: string;
    unit: string;
    totalAmount: number;
    count: number;
    color: string;
  }[];
  totalCount: number;
}
