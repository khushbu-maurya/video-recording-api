import { Request, Response } from "express";
import User from "../model/UserModel";
import { IUserReg, IGenerateLink } from "../interface/user";
import { sign } from "jsonwebtoken";
import File from "../model/FileUpload";
import { IFileUpload } from "../interface/file";
import Link from "../model/LinkModel";
import nodemailer from "nodemailer";
import mongoose from "mongoose";
import validator from "validator";
export const UserReg = async (req: Request<any, any, IUserReg>, res: Response) => {
    try {

        await new User({
            email: req.body.email,
            password: req.body.password,
            uname: req.body.uname
        }).save();
        res.status(200).send({
            status: 200,
            message: "User reg  Success",
        })
    } catch (error) {
        console.log("Error:UserController:UserReg", error);
    }
}
export const UserLogin = async (req: Request, res: Response) => {

    try {
        let email = req.body.email;
        let password = req.body.password;
        let UserData: any = await User.findOne({ email });
        // return res.send(UserData.password)
        if (!UserData) {
            return res.status(400).send({
                message: "User not found !"
            })
        }
        if (UserData.password !== password) {
            return res.status(400).send({
                message: "Invalide username or password"
            })
        }
        if (UserData.password == password) {
            const UserToken = await sign({ id: UserData._id }, process.env.JWT_KEY_USER as string);
            return res.status(200).send({
                message: "Admin Login Success !!",
                token: UserToken
            })
        }
    } catch (error) {
        console.log('Error:UserController:Userlogin', error);

        return res.status(400).send({
            message: "Invalide username or password"
        })
    }
}

export const GenerateLink = async (req: Request<any, any, IGenerateLink>, res: Response) => {

    try {
        const email = req.body.email;
        const title = req.body.title;
        const link = req.body.link;
        const User = req.user;
        const logo = req.file?.filename||null;

        // console.log(User);
        if (!email && !title) {
            return res.status(400).send({
                message: 'Field require !'
            })
        }
        const LinkUser: any = await new Link({
            email: email,
            title: title,
            link: link,
            admin: User,
            logo: logo
        }).save();
        var GenerateLink: any = await `${link}:${LinkUser._id}`;
        const UpdateLink = await Link.findByIdAndUpdate(LinkUser._id, { link: GenerateLink }) // store ulr database
        return res.status(200).send({
            status: "User Link success",
            email: LinkUser.email,
            title: LinkUser.title,
            link: GenerateLink,
            linkid: LinkUser._id,
            logo:LinkUser.logo
        });
    } catch (error) {
        console.log("Error :UserController :GenerateLink", error);
        return res.status(400).send({
            status: "failed",
            message: "cant send email !!"
        });
    }
}

export const UploadFile = async (req: Request<any, any, IFileUpload>, res: Response) => {
    try {
        if (!req.file) {
            return res.status(400).send({
                message: "Video not found!"
            });
        }

        const linkId = req.params.id;

        // Find the existing files associated with the linkid
        const existingFiles: any = await File.findOne({ linkid: linkId })
            .select('files')
            .lean();

        const newFile = req.file.filename;

        if (existingFiles) {
            // Update the files array by adding the new file
            const updatedFiles = [...existingFiles.files, { newFile, createAt: new Date().toISOString() }];

            // Update the files field in the document
            await File.updateOne({ linkid: linkId }, { files: updatedFiles });
        } else {
            // Create a new document if it doesn't exist
            await new File({
                files: [{ newFile, createAt: new Date().toISOString() }],
                linkid: linkId
            }).save();
        }
        return res.status(200).send({
            message: "Video Upload Success!",
            file: `${process.env.client_url}/${newFile}`
        });

    } catch (error) {
        console.log("Error: UserController: FileUpload", error);
        return res.status(500).send({
            message: "File upload error"
        });
    }
};


export const sendEmail = async (req: Request, res: Response) => {
    try {
        const admin = req.user;
        const id = req.params.id;
        const linkUser: any = await Link.findById(id);
        const isValidEmail = validator.isEmail(linkUser?.email || '');
        if (!isValidEmail) {
            // console.log('Invalid email address:', linkUser?.email);
            return res.status(400).send({
                status: 'failed',
                message: 'Invalid email address!',
            });
        }
        // console.log(isValidEmail)
        const transporter = nodemailer.createTransport({
            service: 'Gmail',
            auth: {
                user: 'emailtest8956@gmail.com',
                pass: 'psvrcjdawruxxpew',
            },
        });

        const emailResult = await transporter.sendMail({
            from: 'emailtest8956@gmail.com',
            to: linkUser?.email,
            subject: 'Admin Invite You To Join Link',
            html: `<b>${admin.uname} invites you to join the video create page. Click on the link to join</b><br>
            <b>Title: ${linkUser?.title}</b> <br>
            <a href="${linkUser?.link}">${linkUser?.link} </a>`,
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
    } catch (error) {
        console.log('Error: UserController: email send error:', error);
        return res.status(400).send({
            status: 'failed',
            message: 'Failed to send email!',
        });
    }
};

export const GetFile = async (req: Request, res: Response) => {

    try {
        const linkid: any = (req.query.id);
        //  console.log(await File.find())
        if (linkid) {
            const AllFileData: any = ((await File.aggregate([{ $match: { linkid: new mongoose.Types.ObjectId(linkid) } },
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
                })
            }
            return res.status(200).send({
                message: 'Link user fetch success',
                LinkUser: AllFileData
            })
        }
        else {
            const ifNotID: any = ((await File.aggregate([
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
                })
            }
            return res.status(200).send({
                message: 'Link users fetch success',
                LinkUser: ifNotID
            })
        }

    } catch (error) {
        console.log("Error:UserController :GetFile", error);
        return res.status(400).send({
            message: "User Not Found !"
        })
    }
}

export const test = (req: Request, res: Response) => {
    res.send("test success");
}
export const getlogo = async (req: Request, res: Response) => {
    const linkid = req.params.id
    try {
        if (mongoose.Types.ObjectId.isValid(linkid)) {
            const linkuser = await Link.findById(linkid);
            if (!linkuser) {
                return res.status(403).send({
                    message: "User Not Found"
                })
            }
            return res.status(200).send({
                message: "Link user fetch",
                logo: `${process.env.client_url}/` + linkuser.logo
            })
        }
        return res.status(400).send({
            message: "Pass valid linkid"
        })
    } catch (error) {
        console.log("Error:Usercontroller:getlogo", error);
        return res.status(400).send({
            message: "image  not found"
        })
    }
}
export const edittitle = async (req: Request, res: Response) => {
    try {
        const linkid = req.params.id
        const updatetitle = await Link.findByIdAndUpdate(linkid, { title: req.body.title, logo: req.file?.filename })
        if (!updatetitle) {
            return res.status(400).json({
                message: "Cant update data !"
            })
        } else {
            return res.status(200).json({
                message: "Data update success !"
            })
        }
    } catch (error) {
        console.log('Error:UserController,edittitle',error);
    }
}