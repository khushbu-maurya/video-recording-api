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
exports.edittitle = exports.getlogo = exports.test = exports.GetFile = exports.sendEmail = exports.UploadFile = exports.GenerateLink = exports.UserLogin = exports.UserReg = void 0;
const UserModel_1 = __importDefault(require("../model/UserModel"));
const jsonwebtoken_1 = require("jsonwebtoken");
const FileUpload_1 = __importDefault(require("../model/FileUpload"));
const LinkModel_1 = __importDefault(require("../model/LinkModel"));
const nodemailer_1 = __importDefault(require("nodemailer"));
const mongoose_1 = __importDefault(require("mongoose"));
const validator_1 = __importDefault(require("validator"));
const UserReg = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        yield new UserModel_1.default({
            email: req.body.email,
            password: req.body.password,
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
        let UserData = yield UserModel_1.default.findOne({ email });
        // return res.send(UserData.password)
        if (!UserData) {
            return res.status(400).send({
                message: "User not found !"
            });
        }
        if (UserData.password !== password) {
            return res.status(400).send({
                message: "Invalide username or password"
            });
        }
        if (UserData.password == password) {
            const UserToken = yield (0, jsonwebtoken_1.sign)({ id: UserData._id }, process.env.JWT_KEY_USER);
            return res.status(200).send({
                message: "Admin Login Success !!",
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
    var _a;
    try {
        const email = req.body.email;
        const title = req.body.title;
        const link = req.body.link;
        const User = req.user;
        const logo = ((_a = req.file) === null || _a === void 0 ? void 0 : _a.filename) || null;
        const questions = JSON.parse(req.body.questions) || {};
        if (!email && !title) {
            return res.status(400).send({
                message: 'Field require !'
            });
        }
        const LinkUser = yield new LinkModel_1.default({
            email: email,
            title: title,
            link: link,
            admin: User,
            logo: logo,
            questions: questions
        }).save();
        var GenerateLink = yield `${link}:${LinkUser._id}`;
        const UpdateLink = yield LinkModel_1.default.findByIdAndUpdate(LinkUser._id, { link: GenerateLink }); // store ulr database
        return res.status(200).send({
            status: "User Link success",
            email: LinkUser.email,
            title: LinkUser.title,
            link: GenerateLink,
            linkid: LinkUser._id,
            logo: LinkUser.logo,
            questions: LinkUser.questions
        });
    }
    catch (error) {
        console.log("Error :UserController :GenerateLink", error);
        return res.status(400).send({
            status: "failed",
            message: "cant send email !!"
        });
    }
});
exports.GenerateLink = GenerateLink;
const UploadFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        if (!req.file) {
            return res.status(400).send({
                message: "Video not found!"
            });
        }
        const linkId = req.params.id;
        // Find the existing files associated with the linkid
        const existingFiles = yield FileUpload_1.default.findOne({ linkid: linkId })
            .select('files')
            .lean();
        const newFile = req.file.filename;
        if (existingFiles) {
            // Update the files array by adding the new file
            const updatedFiles = [...existingFiles.files, { newFile, createAt: new Date().toISOString() }];
            // Update the files field in the document
            yield FileUpload_1.default.updateOne({ linkid: linkId }, { files: updatedFiles });
        }
        else {
            // Create a new document if it doesn't exist
            yield new FileUpload_1.default({
                files: [{ newFile, createAt: new Date().toISOString() }],
                linkid: linkId
            }).save();
        }
        return res.status(200).send({
            message: "Video Upload Success!",
            file: `${process.env.client_url}/${newFile}`
        });
    }
    catch (error) {
        console.log("Error: UserController: FileUpload", error);
        return res.status(500).send({
            message: "File upload error"
        });
    }
});
exports.UploadFile = UploadFile;
const sendEmail = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const admin = req.user;
        const id = req.params.id;
        const linkUser = yield LinkModel_1.default.findById(id);
        const isValidEmail = validator_1.default.isEmail((linkUser === null || linkUser === void 0 ? void 0 : linkUser.email) || '');
        if (!isValidEmail) {
            // console.log('Invalid email address:', linkUser?.email);
            return res.status(400).send({
                status: 'failed',
                message: 'Invalid email address!',
            });
        }
        // console.log(isValidEmail)
        const transporter = nodemailer_1.default.createTransport({
            service: 'Gmail',
            auth: {
                user: 'emailtest8956@gmail.com',
                pass: 'psvrcjdawruxxpew',
            },
        });
        const emailResult = yield transporter.sendMail({
            from: 'emailtest8956@gmail.com',
            to: linkUser === null || linkUser === void 0 ? void 0 : linkUser.email,
            subject: 'Admin Invite You To Join Link',
            html: `<b>${admin.uname} invites you to join the video create page. Click on the link to join</b><br>
            <b>Title: ${linkUser === null || linkUser === void 0 ? void 0 : linkUser.title}</b> <br>
            <a href="${linkUser === null || linkUser === void 0 ? void 0 : linkUser.link}">${linkUser === null || linkUser === void 0 ? void 0 : linkUser.link} </a>`,
        });
        // console.log('Email Sent Successfully', emailResult);
        // Check if there are any rejected emails
        if (emailResult.rejected && emailResult.rejected.length > 0) {
            // console.log('Address not found:', emailResult.rejected);
            return res.status(400).send({
                status: 'failed',
                message: 'Address not found!',
            });
        }
        return res.status(200).send({
            message: 'Email Sent Successfully!',
        });
    }
    catch (error) {
        console.log('Error: UserController: email send error:', error);
        return res.status(400).send({
            status: 'failed',
            message: 'Failed to send email!',
        });
    }
});
exports.sendEmail = sendEmail;
const GetFile = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    try {
        const linkid = (req.query.id);
        //  console.log(await File.find())
        if (linkid) {
            const AllFileData = ((yield FileUpload_1.default.aggregate([{ $match: { linkid: new mongoose_1.default.Types.ObjectId(linkid) } },
                {
                    $lookup: {
                        from: "links",
                        localField: "linkid",
                        foreignField: "_id",
                        as: "linkDetail"
                    }
                },
                {
                    $unwind: "$linkDetail"
                },
                {
                    $project: {
                        _id: "$_id",
                        email: "$linkDetail.email",
                        files: {
                            $map: {
                                input: "$files",
                                as: "file",
                                in: {
                                    file: { $concat: [process.env.client_url, "/", "$$file.newFile"] },
                                    createAt: "$$file.createAt"
                                }
                            },
                        },
                        linkid: "$linkid",
                        title: "$linkDetail.title",
                        logo: {
                            $concat: [`${process.env.client_url}/`, { $arrayElemAt: [{ $split: ["$linkDetail.logo", "/"] }, -1] }]
                        },
                        Invitelink: "$linkDetail.link",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    }
                }
            ])));
            // console.log(AllFileData)
            if (AllFileData.length <= 0) {
                return res.status(400).send({
                    message: "User Not Found !"
                });
            }
            return res.status(200).send({
                message: 'Link user fetch success',
                LinkUser: AllFileData
            });
        }
        else {
            const ifNotID = ((yield FileUpload_1.default.aggregate([
                {
                    $lookup: {
                        from: "links",
                        localField: "linkid",
                        foreignField: "_id",
                        as: "linkDetail"
                    }
                },
                {
                    $unwind: "$linkDetail"
                },
                {
                    $project: {
                        _id: "$_id",
                        email: "$linkDetail.email",
                        files: {
                            $map: {
                                input: "$files",
                                as: "file",
                                in: {
                                    file: { $concat: [process.env.client_url, "/", "$$file.newFile"] },
                                    createAt: "$$file.createAt"
                                }
                            }
                        },
                        linkid: "$linkid",
                        title: "$linkDetail.title",
                        logo: {
                            $concat: [`${process.env.client_url}/`, { $arrayElemAt: [{ $split: ["$linkDetail.logo", "/"] }, -1] }]
                        },
                        Invitelink: "$linkDetail.link",
                        createdAt: "$createdAt",
                        updatedAt: "$updatedAt",
                    }
                }
            ])));
            // console.log(ifNotID)
            if (ifNotID.length <= 0) {
                return res.status(400).send({
                    message: "User Not Found !"
                });
            }
            return res.status(200).send({
                message: 'Link users fetch success',
                LinkUser: ifNotID
            });
        }
    }
    catch (error) {
        console.log("Error:UserController :GetFile", error);
        return res.status(400).send({
            message: "User Not Found !"
        });
    }
});
exports.GetFile = GetFile;
const test = (req, res) => {
    res.send("test success");
};
exports.test = test;
const getlogo = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const linkid = req.params.id;
    try {
        if (mongoose_1.default.Types.ObjectId.isValid(linkid)) {
            const linkuser = yield LinkModel_1.default.findById(linkid);
            if (!linkuser) {
                return res.status(403).send({
                    message: "User Not Found"
                });
            }
            return res.status(200).send({
                message: "Link user fetch",
                logo: `${process.env.client_url}/` + linkuser.logo,
                questions: linkuser.questions
            });
        }
        return res.status(400).send({
            message: "Pass valid linkid"
        });
    }
    catch (error) {
        console.log("Error:Usercontroller:getlogo", error);
        return res.status(400).send({
            message: "image  not found"
        });
    }
});
exports.getlogo = getlogo;
const edittitle = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    var _b;
    try {
        const linkid = req.params.id;
        const updatetitle = yield LinkModel_1.default.findByIdAndUpdate(linkid, { title: req.body.title, logo: (_b = req.file) === null || _b === void 0 ? void 0 : _b.filename });
        if (!updatetitle) {
            return res.status(400).json({
                message: "Cant update data !"
            });
        }
        else {
            return res.status(200).json({
                message: "Data update success !"
            });
        }
    }
    catch (error) {
        console.log('Error:UserController,edittitle', error);
    }
});
exports.edittitle = edittitle;
