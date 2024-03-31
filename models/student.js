import mongoose from "mongoose";

const studentSchema = new mongoose.Schema({
    registration_no: { type: String, required: true },
    name: { type: String, required: true },
    course_name: { type: String, required: true },
    date_of_birth: { type: String, required: true },
    gender: { type: String, required: true },
    father_name: { type: String, required: true },
    mother_name: { type: String, required: true },
    address: { type: String, required: true },
    admission_date: { type: String, required: true },
    course_completion_date: { type: String, required: true },
    image_url: { type: String, required: true },
    certificate_url: { type: String, required: true }
}, {timestamps: true});



const Student = new mongoose.model("Student", studentSchema);
export default Student;