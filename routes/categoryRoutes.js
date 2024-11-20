
import express from 'express'
import * as categoryController from '../controllers/categoryController.js'
import { verifyAdmin } from '../middleware/auth.js'

const router = express.Router()


// router.use(verifyAdmin)

router.route('/')
.get(verifyAdmin,categoryController.getCategories)
.post(verifyAdmin, categoryController.postCategory)

router.route('/active')
.get(categoryController.getActiveCategories)
.patch(verifyAdmin, categoryController.toggleIsActive)

router.route('/:id')
.patch(verifyAdmin, categoryController.updateCategory)


export default router