import { Schema, model } from "mongoose";

const adminSchema = new Schema({
  username: {
    type: String,
    unique: [true, "Username already exists"],
    required: [true, "A user must have a username"],
  },
  password: {
    type: String,
    required: [true, "User must have a password"],
  },
  buses: [{ type: Schema.Types.ObjectId, ref: "Bus" }],
  trains: [{ type: Schema.Types.ObjectId, ref: "Train" }],
  createdAt: { type: Date, default: Date.now },
});

const Admin = model("Admin", adminSchema);

export default Admin;
