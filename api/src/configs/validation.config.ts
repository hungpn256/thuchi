import { ValidationPipeOptions } from '@nestjs/common';

export const validationConfig: ValidationPipeOptions = {
  whitelist: true, // Strip properties that do not have any decorators
  transform: true, // Automatically transform payloads to DTO instances
  forbidNonWhitelisted: true, // Throw errors when non-whitelisted values are provided
  transformOptions: {
    enableImplicitConversion: true, // Automatically convert primitive types
  },
  errorHttpStatusCode: 422, // Use 422 Unprocessable Entity for validation errors
};
