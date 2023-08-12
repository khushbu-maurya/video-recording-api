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
        const logo=req.file?.filename;
        if(!logo){
            return res.status(400).send({
                message:"pls add logo file"
            })
        }
        // console.log(User);
        if (!email && !title) {
            return res.status(400).send({
                message: 'Field require !'
            })
        }
        const LinkUser :any= await new Link({
            email: email,
            title: title,
            link: link,
            admin: User,
            logo:logo
        }).save();
        var GenerateLink: any = await `${link}:${LinkUser._id}`;
        const UpdateLink = await Link.findByIdAndUpdate(LinkUser._id, { link: GenerateLink }) // store ulr database
        return res.status(200).send({
            status: "User Link success",
            email: LinkUser.email,
            title: LinkUser.title,
            link: GenerateLink,
            linkid: LinkUser._id,

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
//   console.log(req.params.id);
    try {
        if (!req.file) {
            return res.status(400).send({
                message: "video not found !"
            })
        }
        //   const CheckUser= await File.findById(req.params.id);
        // console.log(req.file)
        const FileUplodSucc = await new File({
            file: req.file?.filename,
            linkid: req.params.id,
        }).save()
        // console.log(FileUplodSucc)                   
        if (!FileUplodSucc) {
            return res.status(400).send({
                message: "video Upload Error !"
            })
        }
        return res.status(200).send({
            message: "video Upload Success !",
            file: `${process.env.client_url}/upload/${req.file?.filename}`
        })

    } catch (error) {
        console.log("Error :UserController :Fileupload ", error)
    }
}
export const sendEmail = async (req: Request, res: Response) => {
    try {
        const admin = req.user;
        const id = req.params.id;
        const linkUser:any = await Link.findById(id);
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
        //  console.log(  await File.find())
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
                    file:  {
                        $concat: [`${process.env.client_url}/upload/`, { $arrayElemAt: [{ $split: ["$file", "/"] }, -1] }]
                    },
                    linkid: "$linkid",
                    title: "$linkDetail.title",
                    logo:{
                        $concat: [`${process.env.client_url}/logo/`, { $arrayElemAt: [{ $split: ["$linkDetail.logo", "/"] }, -1] }]
                    },
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
                        file: {
                            $concat: [`${process.env.client_url}/upload/`, { $arrayElemAt: [{ $split: ["$file", "/"] }, -1] }]
                        },
                        linkid: "$linkid",
                        title: "$linkDetail.title",
                        logo:{
                            $concat: [`${process.env.client_url}/logo/`, { $arrayElemAt: [{ $split: ["$linkDetail.logo", "/"] }, -1] }]
                        },
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
export const getlogo=async(req:Request,res:Response)=>{
    const linkid=req.params.id
       try {
       const linkuser= await Link.findById(linkid);
       if(!linkuser){
        return res.status(400).send({
            message:"User Not Found"
        })
       }
       return res.status(400).send({
        message:"Link user fetch ",
        logo:`${process.env.client_url}/logo/`+linkuser.logo
    })
       
       } catch (error) {
        console.log("Error:Usercontroller:getlogo",error);
       }
}