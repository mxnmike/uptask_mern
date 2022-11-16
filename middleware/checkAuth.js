import jwt from 'jsonwebtoken'
import User from '../models/User.js'
import { sendError, validateObjectId } from '../helpers/helperFunctions.js'

const checkAuth = async (req, res, next) => {
  let token
  try {
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith('Bearer')
    ) {
      token = req.headers.authorization.split(' ')[1]
      const decoded = jwt.verify(token, process.env.JWT_SECRET)

      validateObjectId(decoded.id, res)

      req.user = await User.findById(decoded.id).select(
        '-password -confirmed -token -createdAt -updatedAt -__v'
      )

      if (req.user) {
        return next()
      }
    }
    if (!token) {
      throw { code: 401, message: 'Invalid Token' }
    }
    next()
  } catch (error) {
    sendError(res, error)
  }
}

export default checkAuth
