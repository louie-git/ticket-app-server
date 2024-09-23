
import express from 'express'
import * as priorityController from '../controllers/priorityController.js'

const router = express.Router()



router.route('/')
.get(priorityController.getPriorities)
.post(priorityController.createPriority)

export default router