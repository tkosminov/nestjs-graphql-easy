import { validateDTO } from '../validation/index.js';

import { PaginationInputType } from './input-type.js';

export interface IPaginationValue {
  page: number;
  per_page: number;
}

export interface IParsedPagination {
  limit: number;
  offset?: number;
}

export function parsePagination(data: IPaginationValue) {
  validateDTO(PaginationInputType, data);

  const pagination: IParsedPagination = {
    limit: data.per_page,
  };

  if (data.page != null) {
    pagination.offset = data.page * data.per_page;
  }

  return pagination;
}
