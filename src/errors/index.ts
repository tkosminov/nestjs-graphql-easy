import { HttpException } from '@nestjs/common';

interface IErrData {
  msg?: string;
  raise?: boolean;
}

export const corsNotAllowed = (data?: IErrData) => {
  const err = new HttpException(
    {
      status: 400,
      error: data?.msg || 'CORS_NOT_ALLOWED',
    },
    400,
  );

  if (data?.raise) {
    throw err;
  }

  return err;
};
