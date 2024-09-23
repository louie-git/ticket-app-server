
import express from 'express'
import * as statusController from '../controllers/statusController.js'

const router = express.Router()

router.route('/')
.get(statusController.getStatus)
.post(statusController.createStatus)
export default router