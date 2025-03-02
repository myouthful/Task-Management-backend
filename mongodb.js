const {MongoClient}= require('mongodb');
require('dotenv').config();

const uri= process.env.MONGODB_URI;
const client= new MongoClient(uri);


const connect = async () => {
    try {
        const connection = await client.connect();
        console.log('Successfully connected to MongoDB');
        return client; // Return the client instance, not the connection
    } catch (error) {
        console.error('MongoDB connection error:', error);
        process.exit(1);
    }
};

// Export the promise that resolves to the connected client
module.exports = connect();

