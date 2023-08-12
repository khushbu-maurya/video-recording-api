"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const dotenv = __importStar(require("dotenv"));
const mongoose_1 = __importDefault(require("mongoose"));
const UserRouter_1 = __importDefault(require("./routes/UserRouter"));
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_api_json_1 = __importDefault(require("./swagger-api.json"));
const cors_1 = __importDefault(require("cors"));
const path_1 = __importDefault(require("path"));
const body_parser_1 = __importDefault(require("body-parser"));
dotenv.config();
const app = (0, express_1.default)();
const port = process.env.PORT || 3002;
const dburl = "mongodb+srv://khushbu:yQH2D98k1FLyN9Uq@cluster0.gnaux.mongodb.net/test";
app.use(function (req, res, next) {
    // res.setHeader("Set-Cookie", "HttpOnly;Secure;SameSite=None");
    // res.setHeader('Access-Control-Allow-Origin', '*');
    // res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept');
    // res.setHeader('Access-Control-Allow-Credentials', "true");
    // res.setHeader('Access-Control-Allow-Methods','POST, GET, PUT, PATCH')
    // res.header("Access-control-Allow-Origin","*");
    // res.header("Access-Control-Allow-Headers",'Origin, X-Requested-With, Content-Type, Accept');
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Credentials", "true");
    res.setHeader("Access-Control-Allow-Methods", "GET,HEAD,OPTIONS,POST,PUT");
    res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
    next();
});
const corsOpts = {
    credentials: true,
    origin: '*',
    methods: [
        'GET',
        'POST',
        'PUT',
        'PATCH'
    ],
};
app.use((0, cors_1.default)(corsOpts));
const staticPath = path_1.default.join(__dirname, "./public");
app.use(express_1.default.static(staticPath));
app.use(express_1.default.json());
app.use(body_parser_1.default.urlencoded({ extended: false }));
app.use('/api/user', UserRouter_1.default);
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_api_json_1.default));
mongoose_1.default.connect(dburl).then(() => {
    console.log("Database connected !!");
}).catch(err => {
    console.log("Database connection error", err);
});
app.listen(port, () => {
    console.log(`Server Running on port ${port}`);
});
