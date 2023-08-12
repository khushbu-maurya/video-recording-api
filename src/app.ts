import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import UserRouter from "./routes/UserRouter"
import swaggerUi from "swagger-ui-express";
import swaggerApiDocs from "./swagger-api.json";
import cors from "cors";
import path from "path";
import bodyParser from "body-parser";
dotenv.config();
const app = express();

const port = process.env.PORT || 3002;
const dburl = "mongodb+srv://khushbu:yQH2D98k1FLyN9Uq@cluster0.gnaux.mongodb.net/test"

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

app.use(cors(corsOpts));
const staticPath = path.join(__dirname, "./public")
app.use(express.static(staticPath));

app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }))
app.use('/api/user', UserRouter);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerApiDocs));


mongoose.connect(dburl).then(() => {
    console.log("Database connected !!")
}).catch(err => {
    console.log("Database connection error", err)
})
app.listen(port, () => {
    console.log(`Server Running on port ${port}`)
})


