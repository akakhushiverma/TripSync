import mongoose from "mongoose";
import { model, Schema } from "mongoose";

await mongoose.connect(
  "mongodb+srv://akakhushiverma:O3OITZfXxS6ub7kv@cluster0.0xhylyc.mongodb.net/"
);

// ---------------- USER ----------------
const UserSchema = new Schema({
  username: { type: String, unique: true, required: true },
  password: { type: String, required: true },
  firstname: String,
  lastname: String,
  gender: String,
  dob: String,
  nationality: String,
  city: String,
  state: String,
  email: { type: String, unique: true },
  phone_number: String
});

// ---------------- EVENT ----------------
const EventSchema = new Schema(
  {
    title: { type: String, default: "" },
    date: { type: String, default: "" },
    time: { type: String, default: "" },
    venue: { type: String, default: "" },
    address: { type: String, default: "" },
    image: { type: String, default: "" },
    ticket_link: { type: String, default: "" }
  },
  { _id: false }
);


const FlightSchema = new Schema(
  {
    airline: { type: String, default: "" },
    airline_logo: { type: String, default: "" },
    flight_number: { type: String, default: "" },
    
    // Departure Details
    departure_airport: { type: String, default: "" }, // Name or ID (e.g., "BOM")
    departure_time: { type: String, default: "" },
    
    // Arrival Details
    arrival_airport: { type: String, default: "" },   // Name or ID (e.g., "DEL")
    arrival_time: { type: String, default: "" },
    
    duration: { type: Number, default: 0 },
    price: { type: Number, default: 0 }
  },
  { _id: false }
);

// ---------------- HOTEL ----------------
const HotelSchema = new Schema(
  {
    name: { type: String, required: true },
    price: { type: String, default: "N/A" },
    rating: Number,
    reviews: Number,
    thumbnail: String,
    link: String,
    description: String
  },
  { _id: false }
);

// ---------------- ITINERARY ----------------
const ItenarySchema = new Schema({
  userId: {
    type: mongoose.Types.ObjectId,
    ref: "User",
    required: true
  },
  startDestination: String,
  destination: String,
  startdate: String,
  enddate: String,
  events: {
    type: [EventSchema],
    default: []
  },
  flightdetails: FlightSchema,
  returnflight: FlightSchema,
  hoteldetails: HotelSchema
});

// ---------------- MODELS ----------------
export const UserModel = model("User", UserSchema);
export const ItenaryModel = model("Itenary", ItenarySchema);
