import express from "express";
import mongoose from "mongoose";
import dotenv from "dotenv";
import Student from "./models/student.js";
import cors from "cors";
import multer from 'multer';
import { v2 as cloudinary } from 'cloudinary';
import path from 'path';
import { fileURLToPath } from "url";
import { PDFDocument, rgb } from 'pdf-lib';
import fs from 'fs';
import QRCode from 'qrcode';

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

// MongoDB connection
const connectDB = async () => {
    try {
        const connectionInstance = await mongoose.connect(
            `mongodb+srv://amansirohi:${process.env.DB_PASSWORD}@cluster0.bsek6wa.mongodb.net/students_data`,
            { useNewUrlParser: true, useUnifiedTopology: true }
        );
        console.log("DB Connected", connectionInstance.connection.host)
    } catch (err) {
        console.log(err);
        process.exit(1);
    }
}
connectDB();

// Cloudinary configuration
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});
const storage = multer.diskStorage({});
const upload = multer({ storage: storage });

// Certificate template path
const certificateTemplatePath = 'uploads/certificate.pdf'; // Path to certificate template

// Generate certificate function
async function generateCertificate(name, registration_no) {
    try {
        const existingPdfBytes = fs.readFileSync(certificateTemplatePath);
        const pdfDoc = await PDFDocument.load(existingPdfBytes);
        const page = pdfDoc.getPage(0);

        // Insert student's details into the certificate
        page.drawText(name, { x: 100, y: 280, size: 30 });
        page.drawText(registration_no, { x: 120, y: 120, size: 15 });

        // Generate QR code
        const qrCodeUrl = `https://sirohi-computer.vercel.app/student/${registration_no}`;
        const qrCodeBuffer = await QRCode.toBuffer(qrCodeUrl);

        // Embed QR code into the certificate
        const qrCodeImage = await pdfDoc.embedPng(qrCodeBuffer);
        const qrCodeDims = qrCodeImage.scale(0.6);
        page.drawImage(qrCodeImage, {
            x: 400,
            y: 50,
            width: qrCodeDims.width,
            height: qrCodeDims.height
        });

        const modifiedPdfBytes = await pdfDoc.save();
        return modifiedPdfBytes;
    } catch (error) {
        console.error('Error generating certificate:', error);
        throw error;
    }
}

// Error handling middleware
app.use((err, req, res, next) => {
    console.error('Error occurred:', err); // Log the error
    res.status(500).send('Internal Server Error'); // Send a generic error response
});

// Route to register student
app.post('/register', upload.single('image'), async (req, res, next) => {
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

        if (password !== process.env.PASSWORD) {
            return res.status(401).redirect('/');
        }

        // Generate certificate
        const certificateBytes = await generateCertificate(name, registration_no);
        // Upload image to Cloudinary
        const imageResult = await cloudinary.uploader.upload(req.file.path);
        const imageUrl = imageResult.public_id;

        // Upload certificate to Cloudinary
        const certificateResult = await cloudinary.uploader.upload_stream({ resource_type: 'raw' }, async (error, result) => {
            if (error) {
                console.error('Error uploading certificate to Cloudinary:', error);
                throw error;
            }
            const certificateUrl = result.public_id;

            // Store Cloudinary URLs in MongoDB
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
                image_url: imageUrl, // Store image URL
                certificate_url: certificateUrl // Store certificate URL
            });
            await student.save();
            res.status(201).send('Student registered successfully');
        }).end(certificateBytes);
    } catch (error) {
        console.error('Error registering student:', error);
        res.status(500).send('Error registering student');
    }
});

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
        res.send("error occurred in DB");
    }
});

// Start the server
app.listen(PORT, () => console.log(`Server is running on port ${PORT}`));
