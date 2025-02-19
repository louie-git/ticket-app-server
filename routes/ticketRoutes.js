import express from "express";
import { verifyAdmin } from '../middleware/auth.js'
import * as ticketController  from '../controllers/ticketController.js'
import upload from '../middleware/multer.js'
import multer from 'multer'

import fs from 'fs'
const router = express.Router()


router.route('/')
.get( verifyAdmin, ticketController.getTickets)
.post(upload.array('files') ,ticketController.postTicket)
// .post(async(req,res) => {
//    fs.rename('./uploads/test.png', './uploads/change.png', (err) => {
//     console.log(err)
//     if(err) return res.status(400).send({message: 'Error while renaming file'})
//    })
// })

router.get('/total', verifyAdmin, ticketController.getTotalTickets)

router.route('/dashboard')
.get(verifyAdmin, ticketController.dashboardData)

router.get('/comment', verifyAdmin, ticketController.postMessage)

router.get('/aggregate', ticketController.findUser)

router.get('/my-tickets', ticketController.myTickets)

router.route('/:id')
.get(ticketController.getTicketID)
.post(verifyAdmin,ticketController.updateTicket)

router.route('/user/:user_id')
.get(verifyAdmin, ticketController.getDevTickets)


router.use((err, req, res, next) => {
  if (err instanceof multer.MulterError) {
      // A Multer error occurred when uploading
      if (err.code === 'LIMIT_FILE_SIZE') {
        return res.status(400).send({ message: 'One or more files exceed the size limit of 500kb.' });
      } 
      else if (err.code === 'LIMIT_FILE_COUNT') {
        return res.status(400).send({ message: `You can upload a maximum of 2 files.` });
      } 
      else if (err.code === 'LIMIT_UNEXPECTED_FILE') {
        return res.status(400).send({ message: `Only 'jpg' and 'png' file types are allowed.`  });
      }
      return res.status(400).send({ message: 'Multer error occurred.' });
  } else if (err) {
      // An unknown error occurred
      console.log(err)
      return res.status(500).send({ message: 'An unknown error occurred.' });
  }
  next();
});

export default router