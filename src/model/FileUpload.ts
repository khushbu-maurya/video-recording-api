import { Schema, model } from "mongoose"
import { IFileUpload } from "../interface/file";
const FileSchema = new Schema<IFileUpload>({
   
    email: String,
    file:String,

}, {
    timestamps: true
})

 const File=model<IFileUpload>("File",FileSchema);
 export default File;