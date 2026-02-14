require("dotenv").config();

// Importing required files
const app = require("./src/app.js");
const connectDB = require("./src/config/database.connection.js");

connectDB(); // By this line we are connecting to MongoDB

// Starting the server
app.listen(3000, ()=> {
    console.log("Server is running on port 3000");
})