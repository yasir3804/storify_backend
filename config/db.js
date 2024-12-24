const mongoose = require("mongoose");


const connectDB = async (data) => {
  try {
  const dataname={
    dbName:"storify"
  }
    await mongoose.connect(data,dataname);
    console.log(
      `Connected To Mongodb Database ${mongoose.connection.host}`
    );
  } catch (error) {
    console.log(`Mongodb Database Error ${error}`);
  }
};

module.exports = connectDB;



