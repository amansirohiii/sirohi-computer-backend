import mongoose from "mongoose";
import Student from "./models/student.js";

const connectDB= async()=>{
    try{
        const connectionInstance = await mongoose.connect(`mongodb+srv://amansirohi:${process.env.DB_PASSWORD}@cluster0.bsek6wa.mongodb.net/students_data`);
        console.log("DB Connected", connectionInstance.connection.host)
    }
    catch(err){
        console.log(err);
        process.exit(1);
    }
}
connectDB();

let allStudents = [{

}]

Chat.insertMany(allStudents);