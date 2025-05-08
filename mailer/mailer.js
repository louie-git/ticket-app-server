import nodemailer from 'nodemailer'
import 'dotenv/config'  // require('dotenv).config()
import generateResetEmail from '../mailTemplates/resetPasswordTemplate.js'

const transporter = nodemailer.createTransport({
  host: 'smtp.gmail.com',
  port: 465,
  secure: true,
  auth: {
    user: process.env.GOOGLE_APP_EMAIL,
    pass: process.env.GOOGLE_APP_PASSWORD
  }
});

export default ({to,html}) => {
  transporter.sendMail({
    to: 'vlarrabis@gmail.com',
    subject: 'Email Password Reset',
    html,
  }).then(() => {
    console.log('Email sent')
  }).catch(error => {
    console.log(error.message)
  })
}