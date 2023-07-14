"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const UserController_1 = require("../controller/UserController");
const auth_1 = require("../middleware/auth");
const multer_1 = __importDefault(require("multer"));
const router = express_1.default.Router();
const storage = multer_1.default.diskStorage({
    destination: (req, file, cb) => {
        cb(null, './src/public/upload');
    },
    filename: (req, file, cb) => {
        return cb(null, Date.now() + '_' + file.originalname);
    }
});
const upload = (0, multer_1.default)({ storage: storage });
router.post('/register', UserController_1.UserReg);
router.post('/login', UserController_1.UserLogin);
router.post("/generatelink", auth_1.userAuth, UserController_1.GenerateLink);
router.post("/upload", upload.single("file"), UserController_1.UploadFile);
router.get("/getfile", UserController_1.GetFile);
exports.default = router;
