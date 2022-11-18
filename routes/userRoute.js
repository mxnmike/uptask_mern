import express from 'express'
import checkAuth from '../middleware/checkAuth.js'
import {
  register,
  loginUser,
  confirmUser,
  resetPassword,
  confirmResetToken,
  newPassword,
  profile,
} from '../controllers/userController.js'

const router = express.Router()

//Authentication, Registry y Confirmation of Users
router.post('/', register) // Creates new user
router.post('/login', loginUser)
router.get('/confirm/:token', confirmUser)
router.post('/reset-password', resetPassword)
router.route('/reset-password/:token').get(confirmResetToken).post(newPassword)
router.get('/profile', checkAuth, profile)

export default router
