import { Schema, model } from "mongoose";
import { IUserReg } from "../interface/user";

const UserSchema = new Schema<IUserReg>({
    uname: String,
    email: String,
    password: String,

}, {
    timestamps: true
})

const User = model<IUserReg>("User", UserSchema);
export default User;

