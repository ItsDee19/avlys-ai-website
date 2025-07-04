const { body, validationResult } = require('express-validator');

const profileValidationRules = () => {
  return [
    body('email').optional().isEmail().normalizeEmail().withMessage('Please provide a valid email'),
    body('name').optional().trim().escape(),
    body('business.name').optional().trim().escape(),
    body('business.industry').optional().trim().escape(),
  ];
};

const campaignValidationRules = () => {
    return [
      body('name').not().isEmpty().trim().escape().withMessage('Campaign name is required'),
      body('budget').optional().isNumeric().withMessage('Budget must be a number'),
    ];
};


const validate = (req, res, next) => {
  const errors = validationResult(req);
  if (errors.isEmpty()) {
    return next();
  }
  const extractedErrors = [];
  errors.array().map(err => extractedErrors.push({ [err.param]: err.msg }));

  return res.status(422).json({
    errors: extractedErrors,
  });
};

module.exports = {
  profileValidationRules,
  campaignValidationRules,
  validate,
}; 