import express from 'express'
import { register, authUser } from '../controllers/userController.js'

const router = express.Router()

//Authentication, Registry y Confirmation of Users
router.post('/', register) // Creates new user
router.post('/login', authUser)

export default router
