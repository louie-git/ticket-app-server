
import express from 'express'
import * as categoryController from '../controllers/categoryController.js'
const router = express.Router()



router.route('/')
.get(categoryController.getCategories)
.post(categoryController.postCategory)


export default router