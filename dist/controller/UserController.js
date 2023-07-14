"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.GetFile = exports.UploadFile = exports.GenerateLink = exports.UserLogin = exports.UserReg = void 0;
const UserModel_1 = __importDefault(require("../model/UserModel"));
const bcryptjs_1 = require("bcryptjs");
const jsonwebtoken_1 = require("jsonwebtoken");
const FileUpload_1 = __importDefault(require("../model/FileUpload"));
const LinkModel_1 = __importDefault(require("../model/LinkModel"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const UserReg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const password = req.body.password;
        const HashPassword = yield (0, bcryptjs_1.hash)(password, 10);
        yield new UserModel_1.default({
            email: req.body.email,
            password: HashPassword,
            uname: req.body.uname
        }).save();
        res.status(200).send({
            status: 200,
            message: "User reg  Success",
        });
    }
    catch (error) {
        console.log("Error:UserController:UserReg", error);
    }
});
exports.UserReg = UserReg;
const UserLogin = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        let email = req.body.email;
        let password = req.body.password;
        const UserData = yield UserModel_1.default.findOne({ email });
        if (!UserData) {
            return res.status(400).send({
                message: "User not found !"
            });
        }
        const isCompare = yield (0, bcryptjs_1.compare)(password, UserData.password);
        const UserToken = yield (0, jsonwebtoken_1.sign)({ id: UserData._id }, process.env.JWT_KEY_USER, { expiresIn: "10h" });
        if (!isCompare) {
            return res.status(400).send({
                message: "Invalide username or password"
            });
        }
        if (isCompare) {
            return res.status(200).send({
                message: "User Login Success !!",
                token: UserToken
            });
        }
    }
    catch (error) {
        console.log('Error:UserController:Userlogin', error);
        return res.status(400).send({
            message: "Invalide username or password"
        });
    }
});
exports.UserLogin = UserLogin;
const GenerateLink = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const email = req.body.email;
        const title = req.body.title;
        const link = req.token;
        const User = req.user;
        // console.log(User);
        if (!email && !title) {
            return res.status(400).send({
                message: 'Field require !'
            });
        }
        const LinkUser = yield new LinkModel_1.default({
            email: req.body.email,
            title: req.body.title,
            link: link,
            user: User
        });
        if (LinkUser) {
            const transporter = nodemailer_1.default.createTransport({
                service: "Gmail",
                auth: {
                    user: "emailtest8956@gmail.com",
                    pass: "psvrcjdawruxxpew",
                }
            });
            yield transporter.sendMail({
                from: "emailtest8956@gmail.com",
                to: "khushbum.wa@gmail.com",
                subject: "Admin Invite You To Join Link",
                html: `<b>${User.uname} Invite To join video create page, click on link to join</b><br>
                       <b >Title :${title}</b> <br>
                        <a href="https://www.google.com/"> ${link}</a>`
            }).then((result => {
                console.log("Email Send success");
            })).catch(error => {
                console.log('Email send error', error);
                return res.status(400).send({
                    status: "failed",
                    message: "cant send email !!"
                });
            });
        }
        return res.status(200).send({
            status: "success",
            link: link
        });
    }
    catch (error) {
        console.log("Error :UserController :GenerateLink", error);
    }
});
exports.GenerateLink = GenerateLink;
const UploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file && !req.body.email) {
            return res.status(400).send({
                message: "Pls Enter valide Data !"
            });
        }
        // console.log(req.file?.filename)
        const FileUplodSucc = yield new FileUpload_1.default({
            email: req.body.email,
            file: req.file
        }); // *Not Save
        if (!FileUplodSucc) {
            return res.status(400).send({
                message: "File Upload Error !"
            });
        }
        return res.status(200).send({
            message: "File Upload Success !"
        });
    }
    catch (error) {
        console.log("Error :UserController :Fileupload ", error);
    }
});
exports.UploadFile = UploadFile;
const GetFile = () => __awaiter(void 0, void 0, void 0, function* () {
});
exports.GetFile = GetFile;
