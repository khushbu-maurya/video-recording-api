import express from "express";
import { UserReg ,UserLogin,GenerateLink,UploadFile,GetFile} from "../controller/UserController";
import { userAuth } from "../middleware/auth";
import multer from "multer";
const router=express.Router();

const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/upload');                             
    },
    filename: (req, file, cb) => {
        
        return cb(null, Date.now() + '_' + file.originalname);    
    }
});
const upload=multer({storage:storage});

router.post('/register',UserReg);
router.post('/login',UserLogin);
router.post("/generatelink",userAuth,GenerateLink);
router.post("/upload",upload.single("file"),UploadFile);
router.get("/getfile",GetFile);

export default router;