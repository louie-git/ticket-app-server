import express from 'express'


//Routers 
import ticketRoutes from './ticketRoutes.js'
import userRoutes from './userRoutes.js'
import statusRoutes from './statusRoutes.js'
import priorityRoutes from './priorityRoutes.js'
import categoryRoutes from './categoryRoutes.js'
import designationRoutes from './designationRoutes.js'
const router = express.Router()


router.use('/tickets', ticketRoutes)
router.use('/users', userRoutes)
router.use('/status', statusRoutes)
router.use('/priorities', priorityRoutes)
router.use('/categories', categoryRoutes)
router.use('/designations', designationRoutes)

export default router