const {body,validationResult}= require('express-validator');


// Define validation rules
const userValidationRules = [
  body('email').isEmail().normalizeEmail().withMessage('Must be a valid email'),
  body('password').isLength({ min: 6 }).withMessage('Password must be at least 6 characters'),
  body('firstname').trim().notEmpty().withMessage('First name is required'),
  body('lastname').trim().notEmpty().withMessage('Last name is required')
];


module.exports = {validationResult, userValidationRules};