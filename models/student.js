import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    registration_no: String,
    name: String,
    course_name: String,
    date_of_birth: String,
    gender: String,
    father_name: String,
    mother_name: String,
    address: String,
    admission_date: String,
    course_completion_date: String,
    image_url: String,
}, {timestamps: true});



const Student = new mongoose.model("Student", studentSchema);
export default Student;