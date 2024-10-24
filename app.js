import express from 'express'
import process from 'process'
import dbConnect from './config/db.js';
import cors from 'cors'
import 'dotenv/config'  // require('dotenv).config()


//Routers
import mainRouter from './routes/mainRouter.js'


const app = express()
const port = process.env.PORT ? process.env.PORT : 8002

dbConnect()

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended : false}))


//Content Policy

const corsOptions = {
  origin: 'http://localhost:3000',
  preflightContinue: true,
  credentials: true,
  optionsSuccessStatus: 200
}

app.use(cors(corsOptions))

app.use('/api',  mainRouter)


app.listen(port, ()=> console.log(`Server is now running ${port}`))