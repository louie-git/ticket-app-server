import express from 'express'


import * as userController from '../controllers/userController.js'
const router = express.Router()


router.route('/')
.get(userController.getUsers)
.post(userController.createUser)

router.route('/sign-in')
.get(userController.registerUser)

router.route('/change-password')
.get(userController.changePassword)

router.route('/developers')
.get(userController.getDevs)

router.route('/:id')
.get(userController.getUserById)



router.route('/:id/status')
.post(userController.updateStatus)

export default router