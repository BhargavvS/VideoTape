import dotenv from "dotenv"
// require('dotenv').config({path: "./env"})
import connectDB from "./db/index.js"
import {app} from "./app.js"

dotenv.config({
    path: "./.env"
})


connectDB()
.then( () => {
    app.listen(process.env.PORT || 8000 , ()=> {
        console.log(`connection established ${process.env.PORT}`); 
    })
    app.on("error", (error)=>{
        console.log(
            "mongoose connection error" , error
        )
        throw error
    })
})
.catch( (err) => {
    console.log(`MONGODB connection has failed!!! : ${err}`);
})


/* approach 1
import express from "express"
const app = express()

( async () => {
    await mongoose.connect(`${process.env.MONGODB_URI}/${DB_NAME}`)
    app.on("error", (error)=>{
        console.log(
            "mongoose connection error" , error
        )
        throw error
    })

    app.listen(process.env.PORT , () => {
        console.log(`app is lisenting at the port ${process.env.PORT}`);
    })
})()
*/