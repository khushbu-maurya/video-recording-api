import { Request, Response } from "express";
import User from "../model/UserModel";
import { IUserReg, IGenerateLink } from "../interface/user";
import { hash, compare } from "bcryptjs"
import { sign } from "jsonwebtoken";
import File from "../model/FileUpload";
import { IFileUpload } from "../interface/file";
import Link from "../model/LinkModel";
import nodemailer from "nodemailer";
import sgMail from '@sendgrid/mail';
import nodemailerSendgrid from 'nodemailer-sendgrid';
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
        const UserData: any = await User.findOne({ email });
        if (!UserData) {
            return res.status(400).send({
                message: "User not found !"
            })
        }
       
       
        if (UserData.password!==password) {
            return res.status(400).send({
                message: "Invalide username or password"
            })
        }
        if (UserData.password==password) {
            const UserToken = await sign({ id: UserData._id }, process.env.JWT_KEY_USER as string, { expiresIn: "10h" });
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
        const link = req.token;
        const User = req.user;
        // console.log(User);
        if (!email && !title) {
            return res.status(400).send({
                message: 'Field require !'
            })
        }
        const LinkUser = await new Link({
            email: req.body.email,
            title: req.body.title,
            link: link,
            user: User
        });

        if (LinkUser) {
            const transporter = nodemailer.createTransport({
                service: "Gmail",
                auth: {
                    user: "emailtest8956@gmail.com",
                    pass: "psvrcjdawruxxpew",
                }
            });

            await transporter.sendMail({
                from: "emailtest8956@gmail.com",
                to: email,
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
            })

        }
        return res.status(200).send({
            status: "success",
            link: link
        });
    } catch (error) {
        console.log("Error :UserController :GenerateLink", error);
    }
}
export const UploadFile = async (req: Request<any, any, IFileUpload>, res: Response) => {
    try {
        if (!req.file && !req.body.email) {
            return res.status(400).send({
                message: "Pls Enter valide Data !"
            })
        }
        // console.log(req.file?.filename)

        const FileUplodSucc = await new File({
            email: req.body.email,
            file: req.file
        });                                  // *Not Save
        if (!FileUplodSucc) {
            return res.status(400).send({
                message: "File Upload Error !"
            })
        }
        return res.status(200).send({
            message: "File Upload Success !"
        })

    } catch (error) {
        console.log("Error :UserController :Fileupload ", error)
    }
}
export const GetFile = async () => {

}