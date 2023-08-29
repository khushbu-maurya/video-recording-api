import mongoose, { Schema, model } from "mongoose"
const LinkSchema = new Schema({
   
    email: String,
    title:String,
    link:String,
    logo:String,
    user:mongoose.Types.ObjectId,
    questions: {
        type: Object
    }

}, {
    timestamps: true
})

const Link=model("Link",LinkSchema);
export default Link;