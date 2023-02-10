const mongoose = require('mongoose');

const connectDB = async () => {
    mongoose.set('strictQuery', false);
    try {
        const conn = await mongoose.connect(process.env.MONGO_URI)
        console.log(`MongoDB connected: ${conn.connection.host}`)
    }
    catch (err) {
        console.log(`ERROR: ${err.message}`)
        process.exit()
    }
};
module.exports = connectDB;