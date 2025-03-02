const express = require('express');
const { userValidationRules, validationResult } = require('./formvalidator.js');
const mongodbSocket = require('./mongodb.js')


const Router = express.Router();

Router.post('/signup', userValidationRules, async (req, res) => {
    let client;
    try {
         client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        //use validationResult to check for errors
        const errors = validationResult(req);
        if (!errors.isEmpty()) {
            // Transform errors into a more readable format
            const formattedErrors = errors.array().reduce((acc, error) => {
                acc[error.path] = error.msg;
                return acc;
            }, {});

            return res.status(400).json({
                success: false,
                message: 'Validation failed',
                errors: formattedErrors
            });
        }

        const { firstname, lastname, password, email } = req.body;

        const data = {
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "password": password,
            "role": "Not Assigned"
        }

        const data2 = {
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
        }

        // First Database Operation
        const db1 = client.db('RoleLevel');
        const usersCollection = db1.collection('users');

        // Check if email already exists
        const existingUser = await usersCollection.findOne({ email: email });
        if (existingUser) {
            return res.status(400).json({
                success: false,
                message: 'Email already registered'
            });
        }

        // Insert into first database
        const result1 = await usersCollection.insertOne(data);

        // Second Database Operation
        const db2 = client.db('UsersTMP');
        const adminData = db2.collection('users');

        // Insert into second database
        const result2 = await adminData.insertOne(data2);

        return res.status(201).json({
            success: true,
            message: 'User registered successfully',
            userId: result1.insertedId,
            publicProfileId: result2.insertedId
        });
    } catch (error) {
        console.error('Error during signup:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });

    }


})



module.exports = Router;