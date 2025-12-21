// models/FormData.js
import mongoose from "mongoose";

const FormDataSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
});

const FormDataModel = mongoose.model("log_reg_form", FormDataSchema);

export default FormDataModel;
