"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.userAuth = void 0;
const jsonwebtoken_1 = require("jsonwebtoken");
const UserModel_1 = __importDefault(require("../model/UserModel"));
const userAuth = (req, res, next) => __awaiter(void 0, void 0, void 0, function* () {
    const Token = req.header("Authorization");
    try {
        const isVerify = yield (0, jsonwebtoken_1.verify)(Token, process.env.JWT_KEY_USER);
        if (isVerify) {
            const Userdata = yield UserModel_1.default.findById(isVerify.id);
            req.user = Userdata;
            req.token = Token;
            next();
        }
        else {
            res.status(401).send({
                status: 401,
                message: "unauthorized !!"
            });
        }
    }
    catch (error) {
        console.log("Error: middleware: userAuth: userAuth", error);
        res.status(401).send({
            status: 401,
            message: "unauthorized !!"
        });
    }
});
exports.userAuth = userAuth;
