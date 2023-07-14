"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const mongoose_1 = require("mongoose");
const FileSchema = new mongoose_1.Schema({
    email: String,
    file: String,
}, {
    timestamps: true
});
const File = (0, mongoose_1.model)("File", FileSchema);
exports.default = File;
