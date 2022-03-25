import { validateDTO } from '@helpers/validate.helper';

import { PaginationInputType } from './decorator.pagination';

export interface IPaginationValue {
  page: number;
  per_page: number;
}

export interface IParsedPagination {
  limit: number;
  offset: number;
}

export function parsePagination(data: IPaginationValue): IParsedPagination {
  validateDTO(PaginationInputType, data);

  return {
    limit: data.per_page,
    offset: data.per_page * data.page,
  };
}
