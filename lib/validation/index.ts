import { ClassConstructor, plainToInstance } from 'class-transformer';
import { validateSync, ValidationError } from 'class-validator';
import { GraphQLError } from 'graphql';

function parseValidationError(errors: ValidationError[]) {
  const messages: string[] = [];

  for (const error of errors) {
    if (error.constraints) {
      messages.push(...Object.values(error.constraints));
    }

    if (error.children) {
      messages.push(...parseValidationError(error.children));
    }
  }

  return messages;
}

function castValidationErrorToGraphQLException(errors: ValidationError[]) {
  const message = parseValidationError(errors).join(' ');

  return new GraphQLError(message, {
    originalError: new Error('VALIDATION_ERROR'),
    extensions: {
      code: 'VALIDATION_ERROR',
    },
  });
}

export function validateDTO(type: ClassConstructor<unknown>, value: unknown) {
  const errors: ValidationError[] = validateSync(plainToInstance(type, value) as object, { skipMissingProperties: true });

  if (errors.length > 0) {
    throw castValidationErrorToGraphQLException(errors);
  }
}
