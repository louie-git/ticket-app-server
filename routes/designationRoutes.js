
import express from 'express'
import * as designationController from '../controllers/designationController.js'
import { verifyAdmin } from '../middleware/auth.js'

const router = express.Router()


router.route('/')
.get(verifyAdmin, designationController.getDesignations)
.post(verifyAdmin, designationController.post)

router.route('/active')
.get(designationController.getActiveDesignation)
.patch(verifyAdmin, designationController.toggleIsActive)

router.route('/:id')
.patch(verifyAdmin, designationController.updateDesignation)


// router.get('/test',designationController.updateDesignation)
// .get(designationController.post)

export default router