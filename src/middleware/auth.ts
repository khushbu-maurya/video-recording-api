import { Request, Response, NextFunction } from "express";
import { verify, JwtPayload } from "jsonwebtoken";
import User from "../model/UserModel";
import { IUserReg } from "../interface/user";

declare global {
    namespace Express {
      interface Request {
        user?:any;
        token?:any;
      }
    }
  }
export const userAuth = async (req:Request<IUserReg>, res: Response, next: NextFunction) => {
    const Token: any = req.header("authToken");
    try {
        const isVerify = await verify(Token, process.env.JWT_KEY_USER as any) as JwtPayload;
        if (isVerify) {
            const Userdata = await User.findById(isVerify.id);
            req.user = Userdata;
            req.token=Token;
            next();
        }
        else {
            res.status(401).send({
                status: 401,
                message: "unauthorized !!"
            })
        }
    } catch (error) {
        console.log("Error: middleware: userAuth: userAuth", error);
        res.status(401).send({
            status: 401,
            message: "unauthorized !!"
        })
    }
};
