import User from '../models/User.js'
import generateId from '../helpers/generateId.js'
import generateJWT from '../helpers/generateJWT.js'
import { registerEmail, resetPasswordEmail } from '../helpers/email.js'
import { sendError, sendSuccess } from '../helpers/helperFunctions.js'

const getUserByEmail = async (email, res) => {
  const user = await User.findOne({ email })
  if (!user) {
    throw { code: 404, message: "User doesn't exist" }
  }
  return user
}

const getUserByToken = async (token, res) => {
  const user = await User.findOne({ token })
  if (!user) {
    throw { code: 401, message: 'Invalid Token' }
  }
  return user
}

const register = async (req, res) => {
  const { email } = req.body
  try {
    const foundUser = await User.findOne({ email })
    if (foundUser) {
      throw {
        code: 400,
        message: 'User already registered',
      }
    }

    const user = await User.create(req.body)
    user.token = generateId()
    await user.save()

    registerEmail({
      email: user.email,
      name: user.name,
      token: user.token,
    })
    sendSuccess(res, {
      message:
        'User Created successfully, Check your email to confirm your account',
    })
  } catch (error) {
    console.log('usercontroller error:', error)
    sendError(res, error)
    return
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
  console.log(req.url)
  try {
    const user = await getUserByToken(token, res)

    if (!user) {
      throw { code: 404, message: 'User Not Found' }
    }
    user.confirmed = true
    user.token = ''
    await user.save()
    sendSuccess(res, { message: 'User Confirmed Successfully' })
    return
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
    resetPasswordEmail({
      email: user.email,
      name: user.name,
      token: user.token,
    })
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
      sendSuccess(res, { message: 'Valid Token, Proceed to set New Password' })
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
    user.token = ''
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
