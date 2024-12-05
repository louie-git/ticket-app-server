import express from 'express'
import process from 'process'
import dbConnect from './config/db.js';
import cors from 'cors'
import 'dotenv/config'  // require('dotenv).config()
import { authorizeUser } from './middleware/auth.js';

//Routers
import mainRouter from './routes/mainRouter.js'
import authRoutes from './routes/authRoutes.js'


//Seeder
import UserSeeder from './seeder/UserSeeder.js'
import DesignationSeeder from './seeder/DesignationSeeder.js'

const app = express()
const port = process.env.PORT || 8002

dbConnect()

app.set('view engine', 'ejs');
app.use(express.json());
app.use(express.urlencoded({extended : false}))


//Content Policy

const corsOptions = {
  origin: 'http://localhost:3000',
  preflightContinue: false,
  credentials: true,
  optionsSuccessStatus: 200
}

if(process.argv.slice(2).includes('-production')){
  UserSeeder()
  DesignationSeeder()
}


console.log(process.argv.slice(2))
app.use(cors(corsOptions))

app.use('/api', authorizeUser, mainRouter)

app.use('/auth', authRoutes)

app.listen(port, ()=> console.log(`Server is now running ${port}`))