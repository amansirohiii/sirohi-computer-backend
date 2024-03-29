import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./models/student.js";
import cors from "cors";
dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
app.use(express.urlencoded({ extended: true }));
const allowedOrigins = [
    "*",
    "http://localhost:3000",
    "https://sirohi-computer.vercel.app"
  ];
app.use(
    cors({
      origin: allowedOrigins,
      methods: "GET,POST",
      allowedHeaders: "Content-Type,Authorization",
      credentials: true,
    })
  );



app.get("/", async(req,res)=>{
    res.send("Aman Sirohi")
});



app.get("/student/:rn", async(req, res) => {
    const { rn } = req.params;

        try {
            let student = await Student.find({registration_no: rn});
            res.json(student[0]);
        } catch (err) {
          console.log(err);
          res.send("error occured in DB");
        }
      });


app.listen(PORT, ()=> console.log(`listening on port ${PORT}`));

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
