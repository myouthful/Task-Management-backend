const {body,validationResult}= require('express-validator');


const Emailvalidator = [
    body('email').isEmail().normalizeEmail().withMessage('Must be a valid email')  
]


module.exports={validationResult,Emailvalidator}