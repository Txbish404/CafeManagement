wconst mongoose = require('mongoose');
const dotenv = require('dotenv');

dotenv.config();

const connectDB = async () => {
    mongoose.connect(process.env.MONGO_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
      }).then(() => {
        console.log("Connected to MongoDB");
      }).catch(err => {
        console.error(err.message);
        process.exit(1);
      });
};

module.exports = connectDB;
