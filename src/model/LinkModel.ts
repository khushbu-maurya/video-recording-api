import mongoose, { Schema, model } from "mongoose"
const LinkSchema = new Schema({
   
    email: String,
    tittle:String,
    link:String,
    user:mongoose.Types.ObjectId

}, {
    timestamps: true
})

const Link=model("Link",LinkSchema);
export default Link;