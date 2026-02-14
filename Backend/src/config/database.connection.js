const mongoose  = require("mongoose");

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI)
    .then(() => {
        console.log("Connected to MongoDB");
    })
    .catch((err) => {
        console.log(err);
        process.exit(1); // process.exit(1) is means than if failed to connect to MongoDB, 
        // then we will kill the server and not run the server
    })
}

module.exports = connectDB;