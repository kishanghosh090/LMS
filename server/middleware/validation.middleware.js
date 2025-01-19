import { body, param, query, validationResult } from "express-validator";

export const validate = (validations) => {
  return async (req, res, next) => {
    // run all validations
    await Promise.all(validations.map((validation) => validation.run(req)));
    const errors = validationResult(req);
    if (errors.isEmpty()) {
      return next();
    }
    const extarctedErrors = errors.array().map((error) => {
      field: error.path;
      message: error.msg;
    });
    throw new Error("Validation Failed", { cause: extarctedErrors });
  };
};

export const commamonValidations = {
  pagination: [
    query("page")
      .optional()
      .isInt({ min: 1 })
      .withMessage("page must be a positive integer"),
    query("limit")
      .optional()
      .isInt({ max: 100 })
      .withMessage("limit must be a positive integer"),
  ],
  email: body("email")
    .isEmail()
    .normalizeEmail()
    .withMessage("Please enter a valid email address"),
  name: body("name")
    .trim()
    .isLength({ min: 3, max: 50 })
    .withMessage("Name is required"),
};

export const validateSignUp = validate([
  commamonValidations.email,
  commamonValidations.name,
]);
