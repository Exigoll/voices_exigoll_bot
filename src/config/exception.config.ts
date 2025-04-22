import { BadRequestException, ValidationError } from "@nestjs/common";

export const createValidationException = (errors: ValidationError[]) => {
  const customErrors = errors.map(err => ({
    field: err.property,
    messages: Object.values(err.constraints || {})
  }));
  return new BadRequestException({
    message: "Validation failed",
    errors: customErrors
  });
};
