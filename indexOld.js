import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./models/student.js";
import cors from "cors";
import multer from 'multer';
// import { CloudinaryStorage } from 'multer-storage-cloudinary';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from "url";

dotenv.config();
const app = express();
const PORT = process.env.PORT || 5000;
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.json());
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



  app.get('/', (req, res) => {
    res.render('index');
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


cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
  });
  const storage = multer.diskStorage({});
  const upload = multer({ storage: storage });




  app.post('/register', upload.single('image'), async (req, res) => {
    try {
      const {
        registration_no,
        name,
        course_name,
        date_of_birth,
        gender,
        father_name,
        mother_name,
        address,
        admission_date,
        course_completion_date,
        password
      } = req.body;
      if(password !== process.env.PASSWORD){
        return res.status(401).redirect('/');
        }
      const result = await cloudinary.uploader.upload(req.file.path);
        const imageUrl = result.public_id;

      const student = new Student({
        registration_no,
        name,
        course_name,
        date_of_birth,
        gender,
        father_name,
        mother_name,
        address,
        admission_date,
        course_completion_date,
        image_url: imageUrl
      });

      await student.save();
      res.status(201).send('Student registered successfully');
    } catch (error) {
      console.error(error);
      res.status(500).send('Error registering student');
    }
  });



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
