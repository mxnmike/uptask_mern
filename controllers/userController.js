import User from '../models/User.js'
import generateId from '../helpers/generateId.js'
import generateJWT from '../helpers/generateJWT.js'
import {
  validateObjectId,
  sendError,
  sendSuccess,
  sendObject,
} from '../helpers/helperFunctions.js'

const getUserByEmail = async (email, res) => {
  try {
    const user = await User.findOne({ email })
    if (!user) {
      throw { code: 404, message: "User doesn't exist" }
    }
    return user
  } catch (error) {
    sendError(res, error)
  }
}

const getUserByToken = async (token, res) => {
  try {
    const user = await User.findOne({ token })
    if (!user) {
      throw { code: 401, message: 'Invalid Token' }
    }
    return user
  } catch (error) {
    sendError(res, error)
  }
}

const register = async (req, res) => {
  const { email } = req.body
  try {
    if (await getUserByEmail(email, res)) {
      throw { code: 400, message: 'User already registered' }
    }

    const user = new User(req.body)
    user.token = generateId()
    const storedUser = await user.save()
    sendSuccess(res, { message: `User Created:${storedUser.email}` })
  } catch (error) {
    sendError(res, error)
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body
  try {
    const user = await getUserByEmail(email, res)

    if (!user) {
      throw { code: 404, message: "User doesn't exist" }
    } else if (!user.confirmed) {
      throw { code: 401, message: 'Please confirm your account' }
    }
    if (await user.verifyPasswords(password)) {
      return res.json({
        id: user._id,
        nombre: user.name,
        email: user.email,
        token: generateJWT(user._id),
      })
    } else {
      throw { code: 401, message: 'Incorrect Password' }
    }
  } catch (error) {
    sendError(res, error)
  }
}

const confirmUser = async (req, res) => {
  const { token } = req.params
  try {
    const user = await getUserByToken(token, res)

    if (!user) {
      throw { code: 404, message: 'User Not Found' }
    }
    user.confirmed = true
    user.token = null
    await user.save()
    sendSuccess(res, { message: user })
  } catch (error) {
    sendError(res, error)
  }
}

const resetPassword = async (req, res) => {
  const { email } = req.body
  try {
    const user = await getUserByEmail(email, res)
    if (!user) {
      throw { code: 404, message: 'User Not Found' }
    }
    user.token = generateId()
    await user.save()
    sendSuccess(res, {
      message: 'Hemos enviado un email con las instrucciones.',
    })
  } catch (error) {
    sendError(res, error)
  }
}

const confirmResetToken = async (req, res) => {
  const { token } = req.params
  try {
    const user = await getUserByToken(token, res)
    if (!user) {
      throw { code: 401, message: 'Invalid Token' }
    } else {
      sendSuccess(res, { message: 'Valid User and Valid Token' })
    }
  } catch (error) {
    sendError(res, error)
  }
}

const newPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  try {
    const user = await getUserByToken(token, res)
    if (!user) {
      throw { code: 401, message: 'Invalid Token' }
    }
    user.password = password
    user.confirmed = true
    user.token = null
    await user.save()

    sendSuccess(res, { message: 'Password Saved Successfully.' })
  } catch (error) {
    sendError(res, error)
  }
}

const profile = async (req, res) => {
  const { user } = req
  res.json({ statusCode: 200, user })
}

export {
  register,
  loginUser,
  confirmUser,
  resetPassword,
  confirmResetToken,
  newPassword,
  profile,
}
