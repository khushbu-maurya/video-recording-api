import express from "express";
import { UserReg ,UserLogin,GenerateLink,UploadFile,GetFile,sendEmail,test,getlogo} from "../controller/UserController";
import { userAuth } from "../middleware/auth";
import multer from "multer";
import path from "path";
import { Request,Response } from "express";
import fs from  'fs';
const router=express.Router();
// upload file
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        const filesDir = path.join(__dirname, '../public');
        if (!fs.existsSync(filesDir)) {
            // if not create directory
                fs.mkdirSync(filesDir);
                cb(null, path.join(__dirname, '../public'));    
            }
            else{
                cb(null, path.join(__dirname, '../public')); 
            }
                                  
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + '_' + file.originalname);    
    }
});
const upload=multer({storage:storage});
//upload logo
// const logostorage = multer.diskStorage({
//     destination: (req, file, cb) => {
//         const filesDir = 'src/public/logo';
//         if (!fs.existsSync(filesDir)) {
//             // if not create directory
//                 fs.mkdirSync(filesDir);
//                 cb(null, path.join(__dirname, '../public/logo'));
//             }
//             else{
//                 cb(null, path.join(__dirname, '../public/logo')); 
//             }                          
//     },
//     filename: (req, file, cb) => {
//         return cb(null, Date.now() + '_' + file.originalname);  
        
//     }
// });
// const uploadlogo=multer({storage:logostorage});
// // console.log(uploadlogo);

router.post('/register',UserReg);
router.post('/login',UserLogin);
router.post("/generatelink",userAuth,upload.single("file"),GenerateLink);
router.post("/upload/:id",upload.single("file"),UploadFile);
router.get("/getfile",GetFile);
router.get("/sendemail/:id",userAuth,sendEmail);
router.get("/test",test);
router.get('/logo/:id',userAuth,getlogo);

export default router;