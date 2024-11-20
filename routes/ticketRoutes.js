import express from "express";
import { verifyAdmin } from '../middleware/auth.js'
import * as ticketController  from '../controllers/ticketController.js'

const router = express.Router()


router.route('/')
.get( verifyAdmin, ticketController.getTickets)
.post(ticketController.postTicket)

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


export default router