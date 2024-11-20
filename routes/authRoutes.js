import express from 'express'
import { authenticateUser, fnRefreshToken, authorizeUser, logout } from '../middleware/auth.js'
import { getTickets } from '../controllers/ticketController.js'
import { registerUser } from '../controllers/userController.js'

const router = express.Router()


router.post('/login', authenticateUser)

router.post('/refresh-token', fnRefreshToken)

router.get('/token', authorizeUser)

router.get('/logout', logout )

router.post('/sign-in', registerUser)

export default  router
