import { HttpException } from '@nestjs/common';

interface IErrData {
  msg?: string;
  raise?: boolean;
}

export const bad_request = (data?: IErrData) => {
  const err = new HttpException(
    {
      status: 400,
      error: data?.msg || 'BAD_REQUEST',
    },
    400
  );

  if (data?.raise) {
    throw err;
  }

  return err;
};
