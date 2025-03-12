const express = require('express');
const { userValidationRules, validationResult } = require('./middlewares/formvalidator.js');
const { Emailvalidator } = require('./middlewares/roleassignvalidator.js')
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
            "role": "Not Assigned",

            "validated": "false"

        }

        const data2 = {
            "firstname": firstname,
            "lastname": lastname,
            "email": email,
            "validated": "false"
        }

        // First Database Operation
        const db1 = client.db('UsersTMP');
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
        const db2 = client.db('RoleLevel');
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


});


Router.get('/recentsignup', async (req, res) => {

    let client;
    try {

        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }
        const db = client.db('RoleLevel');
        const validatedUsersList = db.collection('users');

        const users = await validatedUsersList.find({ validated:false }).toArray();

        if (!users) {
            return res.status(401).json({
                success: false,
                message: 'No recent signup'
            })
        }

        return res.status(200).json({
            success: true,
            message: 'Recent signups',
            users: users
        })
    } catch (error) {
        console.error('unable to fetch recent signup');
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        })
    }

});


Router.post('/login', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        const { email, password} = req.body;

        const db = client.db('UsersTMP');
        const usersCollection = db.collection('users');

        const user = await usersCollection.findOne({ email: email, password: password });

        if (!user) {
            return res.status(401).json({
                success: false,
                message: 'Invalid email or password'
            });
        }

        // Check if role is "Not Assigned"
        if (user.role === "Not Assigned" && user.validated === false) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. You have not been granted access. Please email mydreamconnect@gmail.com for support'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Login successful',
            user: user
        });

    } catch (error) {
        console.error('Error during login:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


Router.post('/changeroles', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        const { email, role, dept } = req.body;

        const db = client.db('UsersTMP');
        const usersCollection = db.collection('users');

        const result = await usersCollection.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    role: role.toLowerCase(),
                    department: dept.toUpperCase()
                }
            },
            { returnDocument: 'after' }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'role changed successfully'
        });


    } catch (error) {
        console.error('Error assigning role and department:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


Router.post('/assignroles', Emailvalidator, async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }
        console.log('Received Request:', req.body);


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

        const { role, email, dept } = req.body;

        // Validate role
        if (!['intern', 'staff', 'team lead'].includes(role.toLowerCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid role. Role must be either "intern","staff" or Team Lead'
            });
        }

        // Validate department
        if (!['AOF', 'IDP', 'PDE'].includes(dept.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department. Department must be either "AOF", "IDP", or "PDE"'
            });
        }

        // Connect to UsersTMP database
        const db = client.db('UsersTMP');
        const usersCollection = db.collection('users');

        // Find and update the user document with both role and department
        const result = await usersCollection.findOneAndUpdate(
            { email: email },
            {
                $set: {
                    role: role.toLowerCase(),
                    department: dept.toUpperCase()
                }
            },
            {
                returnDocument: 'after',
                upsert: false
            }
        );

        if (!result) {
            return res.status(404).json({
                success: false,
                message: 'User not found'
            });
        }

        const validation = client.db('RoleLevel');
        const validatedUsers = validation.collection('users');

        const validated = await validatedUsers.findOneAndUpdate(
            { email: email },
            {
                $set: {

                    validated: "true"

                }
            },
            {
                returnDocument: 'after',
                upsert: false
            }
        )

        if (!validated) {
            return res.status(404).json({
                success: false,
                message: 'Error validating'
            });
        }

        const tasksDB = client.db('TasksMP');
        const collectionName = email;

        try {
            await tasksDB.createCollection(collectionName);
            // Initialize the collection with default document including department
            // await tasksDB.collection(collectionName).insertOne({
            //     email: email,
            //     role: role.toLowerCase(),
            //     department: dept.toUpperCase(),
            //     tasks: [],
            //     createdAt: new Date()
            // });
        } catch (error) {
            console.log('Collection might already exist:', error.message);
        }

        return res.status(200).json({
            success: true,
            message: 'Role and department assigned successfully',
            user: result
        });

    } catch (error) {
        console.error('Error assigning role and department:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


Router.post('/tasks', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        // Validate that req.body is an array
        if (!Array.isArray(req.body)) {
            return res.status(400).json({
                success: false,
                message: 'Request body must be an array of tasks'
            });
        }

        const tasksDB = client.db('TasksMP');
        const tasksCollection = tasksDB.collection('tasks');
        
        // Process each task in the array
        const processPromises = req.body.map(async (task) => {
            const {
                taskid,
                taskname,
                taskdescription,
                dept,
                assignto,
                assignee,
                taskcreator,
                taskstatus,
                dueDate
            } = task;

            // Validate and convert dueDate
            let convertedDueDate;
            try {
                if (!dueDate) throw new Error('Due date is required');
                convertedDueDate = new Date(dueDate);
                if (isNaN(convertedDueDate.getTime())) throw new Error('Invalid date format');
                if (convertedDueDate < new Date()) throw new Error('Due date cannot be in the past');
            } catch (error) {
                throw new Error(`Invalid date for task ${taskid}: ${error.message}`);
            }

            // Validate assignee is an array
            if (!Array.isArray(assignee)) {
                throw new Error(`assignee must be an array of emails for task ${taskid}`);
            }

            const data1 = {
                taskId: taskid,
                taskName: taskname,
                taskdescription: taskdescription,
                dueDate: convertedDueDate,
                assignedTo: assignee,
                assignedNames: assignto,
                Status: taskstatus,
                taskcreator: taskcreator,
                dept: dept,
                noOfExpectedResponse: assignto.length,
                responseRecieved: 0,
                userswhosubmitted: [],
                nosubmits: assignto.slice()
            };

            const data2 = {
                taskId: taskid,
                taskName: taskname,
                taskdescription: taskdescription,
                dueDate: convertedDueDate,
                Status: "Not done"
            };

            // Insert task into main collection
            await tasksCollection.insertOne(data1);

            // Insert into each assignee's collection
            const assigneePromises = assignee.map(assigneeEmail =>
                tasksDB.collection(assigneeEmail).insertOne(data2)
            );

            await Promise.all(assigneePromises);
        });

        // Wait for all tasks to be processed
        await Promise.all(processPromises);

        return res.status(201).json({
            success: true,
            message: 'All tasks created and assigned successfully'
        });

    } catch (error) {
        console.error('Error creating tasks:', error);
        return res.status(500).json({
            success: false,
            message: error.message || 'Internal server error'
        });
    }
});


Router.post('/submittask', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        const { name, taskId,email } = req.body;

        // Connect to TasksMP database
        const tasksDB = client.db('TasksMP');
        const tasksCollection = tasksDB.collection('tasks');

        // First update the main task document
        const taskUpdate = await tasksCollection.findOneAndUpdate(
            { taskId: taskId },
            {
                $pull: { nosubmits: name },          // Remove name from nosubmits
                $inc: { responseRecieved: 1 },       // Increment responseRecieved
                $push: { userswhosubmitted: name }   // Add name to userswhosubmitted
            },
            { returnDocument: 'after' }
        );

        if (!taskUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Task not found'
            });
        }

        // Then update the intern's personal collection
        const internCollection = tasksDB.collection(email);
        const internTaskUpdate = await internCollection.findOneAndUpdate(
            { taskId: taskId },
            { $set: { Status: "done" } },
            { returnDocument: 'after' }
        );

        if (!internTaskUpdate) {
            return res.status(404).json({
                success: false,
                message: 'Task not found in intern collection'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Task submission successful',
            task: taskUpdate
        });

    } catch (error) {
        console.error('Error submitting task:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


Router.get('/taskupdates', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        // Connect to TasksMP database
        const tasksDB = client.db('TasksMP');
        const tasksCollection = tasksDB.collection('tasks');

        // Fetch all documents, sorted by date (newest first)
        const tasks = await tasksCollection
            .find({})
            .sort({ dueDate: -1 })
            .toArray();

        if (!tasks.length) {
            return res.status(404).json({
                success: false,
                message: 'No tasks found'
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Tasks retrieved successfully',
            tasks: tasks
        });

    } catch (error) {
        console.error('Error fetching tasks:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


Router.get('/internlog', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        const email = req.query.email;

        // Connect to TasksMP database
        const tasksDB = client.db('TasksMP');

        try {
            // Get the collection for this intern
            const internCollection = tasksDB.collection(email);

            // Fetch the first 10 documents, sorted by date (newest first)
            const tasks = await internCollection
                .find({})
                .sort({ dueDate: -1 })
                .limit(10)
                .toArray();

            if (!tasks.length) {
                return res.status(404).json({
                    success: false,
                    message: 'No tasks found for this intern'
                });
            }

            return res.status(200).json({
                success: true,
                message: 'Tasks retrieved successfully',
                tasks: tasks
            });

        } catch (error) {
            console.error('Error accessing intern collection:', error);
            return res.status(404).json({
                success: false,
                message: 'Intern collection not found'
            });
        }

    } catch (error) {
        console.error('Error fetching intern logs:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


Router.post('/fetchteam', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        const { dept, email } = req.body;

        // Validate department
        if (!['AOF', 'IDP', 'PDE'].includes(dept.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department. Department must be either "AOF", "IDP", or "PDE"'
            });
        }

        const db = client.db('UsersTMP');
        const usersCollection = db.collection('users');

        // First verify if requesting user is a staff member in the same department
        const requestingUser = await usersCollection.findOne({
            email: email,
            role: 'staff',
            department: dept.toUpperCase()
        });

        if (!requestingUser) {
            return res.status(403).json({
                success: false,
                message: 'Access denied. Only staff members can view their department interns.'
            });
        }

        // If staff verified, find interns in the department
        const teamMembers = await usersCollection
            .find({
                department: dept.toUpperCase(),
                role: 'intern'
            })
            .project({
                email: 1,
                firstname: 1,
                _id: 0
            })
            .toArray();

        if (!teamMembers.length) {
            return res.status(404).json({
                success: false,
                message: `No interns found in ${dept.toUpperCase()} department`
            });
        }

        return res.status(200).json({
            success: true,
            message: `Interns in ${dept.toUpperCase()} department retrieved successfully`,
            team: teamMembers
        });

    } catch (error) {
        console.error('Error fetching team:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }
});


Router.post('/namefetch', async (req, res) => {
    let client;
    try {
        client = await mongodbSocket;
        if (!client) {
            throw new Error('Database connection not established');
        }

        const { dept } = req.body;
        // Validate department
        if (!['AOF', 'IDP', 'PDE'].includes(dept.toUpperCase())) {
            return res.status(400).json({
                success: false,
                message: 'Invalid department'
            });
        }

        const db = client.db('UsersTMP');
        const usersCollection = db.collection('users');

        // Fetch users and transform the data
        const users = await usersCollection
            .find({ department: dept.toUpperCase() })
            .project({
                name: { $concat: ['$firstname', ' ', '$lastname'] },
                email: 1,
                _id: 0
            })
            .toArray();

        if (!users.length) {
            return res.status(404).json({
                success: false,
                message: `No users found in ${dept.toUpperCase()} department`
            });
        }

        return res.status(200).json({
            success: true,
            message: 'Users fetched successfully',
            users: users
        });
    } catch (error) {
        console.error('Error fetching users:', error);
        return res.status(500).json({
            success: false,
            message: 'Internal server error'
        });
    }

})


module.exports = Router;