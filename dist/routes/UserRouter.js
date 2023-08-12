"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controller/UserController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const path_1 = __importDefault(require("path"));
const fs_1 = __importDefault(require("fs"));
const router = express_1.default.Router();
// upload file
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        const filesDir = path_1.default.join(__dirname, '../public');
        if (!fs_1.default.existsSync(filesDir)) {
            // if not create directory
            fs_1.default.mkdirSync(filesDir);
            cb(null, path_1.default.join(__dirname, '../public'));
        }
        else {
            cb(null, path_1.default.join(__dirname, '../public'));
        }
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
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
router.post('/register', UserController_1.UserReg);
router.post('/login', UserController_1.UserLogin);
router.post("/generatelink", auth_1.userAuth, upload.single("file"), UserController_1.GenerateLink);
router.post("/upload/:id", upload.single("file"), UserController_1.UploadFile);
router.get("/getfile", UserController_1.GetFile);
router.get("/sendemail/:id", auth_1.userAuth, UserController_1.sendEmail);
router.get("/test", UserController_1.test);
router.get('/logo/:id', auth_1.userAuth, UserController_1.getlogo);
exports.default = router;
