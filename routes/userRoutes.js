import express from 'express'
import { verifyAdmin } from '../middleware/auth.js'


import * as userController from '../controllers/userController.js'
const router = express.Router()


router.route('/')
.get(verifyAdmin, userController.getUsers)
.post(verifyAdmin, userController.createUser)

// router.route('/sign-in')
// .get(userController.registerUser)

router.route('/change-password')
.post(userController.changePassword)

router.route('/developers')
.get(verifyAdmin, userController.getDevs)

router.route('/:id')
.get(verifyAdmin, userController.getUserById)


router.route('/:id/status')
.post(verifyAdmin, userController.updateStatus)

export default router