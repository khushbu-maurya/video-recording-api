import express from "express";
import * as dotenv from "dotenv";
import mongoose from "mongoose";
import UserRouter from "./routes/UserRouter"
import swaggerUi from "swagger-ui-express";
import swaggerApiDocs from "./swagger-api.json";
import path from "path";
dotenv.config();
const app=express();

const port=process.env.PORT||3002;
const dburl=process.env.DBURL as any
const staticPath=path.join(__dirname,"./public")
app.use(express.static(staticPath));
app.use(express.json());
app.use('/api/user',UserRouter);
app.use("/api-docs",swaggerUi.serve,swaggerUi.setup(swaggerApiDocs));


mongoose.connect(dburl).then(()=>{
    console.log("Database connected !!")
}).catch(err=>{
    console.log("Database connection error",err)
})
app.listen(port,()=>{
    console.log(`Server Running on port ${port}`)
})


