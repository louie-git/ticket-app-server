import express from 'express'


import * as userController from '../controllers/userController.js'
const router = express.Router()


router.route('/')
.get(userController.getUsers)
.post(userController.createUser)

router.route('/:id')
.get(userController.getUserById)


export default router