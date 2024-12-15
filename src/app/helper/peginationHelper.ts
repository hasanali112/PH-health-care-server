type TOptions = {
  page?: number;
  limit?: number;
  sortOrder?: string;
  sortBy?: string;
};

type TResult = {
  page: number;
  limit: number;
  skip: number;
  sortBy: string;
  sortOrder: string;
};

const calculatePagination = (options: TOptions): TResult => {
  const page: number = Number(options.page) || 1;
  const limit: number = Number(options.limit) || 10;
  const sortBy: string = String(options.sortBy) || "createdAt";
  const sortOrder: string = String(options.sortOrder) || "desc";

  const skip = (page - 1) * limit;

  return { page, limit, skip, sortBy, sortOrder };
};

export const paginatioHelper = {
  calculatePagination,
};
