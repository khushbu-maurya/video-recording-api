import express from "express";
import { UserReg ,UserLogin,GenerateLink,UploadFile,GetFile,sendEmail,test,getlogo} from "../controller/UserController";
import { userAuth } from "../middleware/auth";
import multer from "multer";
import path from "path";
import { Request,Response } from "express";
const router=express.Router();
// upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/upload'));                              // if check local then local path
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + '_' + file.originalname);    
    }
});
const upload=multer({storage:storage});
//upload logo
const logostorage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, path.join(__dirname, '../public/logo'));                              // if check local then local path
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + '_' + file.originalname);    
    }
});
const uploadlogo=multer({storage:logostorage});
// console.log(uploadlogo);

router.post('/register',UserReg);
router.post('/login',UserLogin);
router.post("/generatelink",userAuth,uploadlogo.single("file"),GenerateLink);
router.post("/upload/:id",upload.single("file"),UploadFile);
router.get("/getfile",GetFile);
router.get("/sendemail/:id",userAuth,sendEmail);
router.get("/test",test);
router.get('/logo/:id',userAuth,getlogo);

export default router;