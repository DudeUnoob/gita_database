const mongoose = require("mongoose");
const environment = require('../config/environment');
const SrimadBhagavatam = require('../model/SrimadBhagavatam');

async function clearCollection() {
    try {
        // Connect to MongoDB
        await mongoose.connect(environment.MONGODB_URI);
        console.log(`Connected to MongoDB in ${environment.NODE_ENV} mode`);

        // Delete all documents from the collection
        const result = await SrimadBhagavatam.deleteMany({});
        console.log(`Successfully deleted ${result.deletedCount} documents from SrimadBhagavatam collection`);

    } catch (error) {
        console.error('Error clearing collection:', error);
    } finally {
        // Close the connection
        await mongoose.connection.close();
        console.log('MongoDB connection closed');
    }
}

// Run the clear function
clearCollection().catch(console.error);
