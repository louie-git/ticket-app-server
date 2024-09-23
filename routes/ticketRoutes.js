import express from "express";
import * as ticketController  from '../controllers/ticketController.js'

const router = express.Router()


router.route('/')
.get(ticketController.getTickets)
.post(ticketController.postTicket)

router.get('/total',ticketController.getTotalTickets)

router.route('/:id')
.get(ticketController.getTicketID)
.post(ticketController.updateTicket)

router.route('/user/:user_id')
.get(ticketController.getDevTickets)

export default router