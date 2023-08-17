import mongoose, { Schema, model } from "mongoose"
import { IFileUpload } from "../interface/file";

const FileSchema = new Schema<IFileUpload>({
   
    email: String,
    files: {
        type: [String], 
        set: setFiles
    },
    linkid:mongoose.Types.ObjectId
}, {
    timestamps: true
})
function setFiles(files:any) {
    if (Array.isArray(files)) {
        return Array.from(new Set(files));
    } else {
        return [files];
    }
}
 const File=model<IFileUpload>("File",FileSchema);
 export default File;