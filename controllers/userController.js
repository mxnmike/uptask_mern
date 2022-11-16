import User from '../models/User.js'
import generateId from '../helpers/generateId.js'
import generateJWT from '../helpers/generateJWT.js'

const getUserByEmail = async (email, res) => {
  const user = await User.findOne({ email })
  if (!user) {
    const error = new Error("User doesn't exist")
    return res.status(404).json({ msg: error.message })
  }
  return user
}

const getUserByToken = async (token, res) => {
  const user = await User.findOne({ token })
  if (!user) {
    const error = new Error('Invalid Token')
    return res.status(404).json({ msg: error.message })
  }
  return user
}

const register = async (req, res) => {
  const { email } = req.body

  if (await getUserByEmail(email, res)) {
    const error = new Error('User already registered')
    return res.status(400).json({ msg: error.message })
  }
  try {
    const user = new User(req.body)
    user.token = generateId()
    const storedUser = await user.save()
    res.json({ msg: `User Created:${storedUser.email}` })
  } catch (error) {
    res.json({ msg: `${error.message}` })
    console.log(error)
  }
}

const loginUser = async (req, res) => {
  const { email, password } = req.body
  console.log('email:', email)
  const user = await getUserByEmail(email, res)

  if (!user) {
    const error = new Error("User doesn't exist")
    return res.status(404).json({ msg: error.message })
  } else if (!user.confirmed) {
    const error = new Error('Please confirm your account')
    return res.status(404).json({ msg: error.message })
  }
  if (await user.verifyPasswords(password)) {
    return res.status(200).json({
      id: user._id,
      nombre: user.name,
      email: user.email,
      token: generateJWT(user._id),
    })
  } else {
    const error = new Error('Incorrect Password')
    return res.status(404).json({ msg: error.message })
  }
}

const confirmUser = async (req, res) => {
  const { token } = req.params

  const user = await getUserByToken(token, res)

  if (user) {
    try {
      user.confirmed = true
      user.token = null
      await user.save()
    } catch (error) {
      console.log(error)
    }

    return res.json({ msg: user })
  }
}

const resetPassword = async (req, res) => {
  const { email } = req.body
  const user = await getUserByEmail(email, res)
  console.log(user)
  if (user) {
    try {
      user.token = generateId()
      await user.save()
      res.json({ msg: 'Hemos enviado un email con las instrucciones.' })
    } catch (error) {
      console.log(error)
    }
  }
}

const confirmResetToken = async (req, res) => {
  const { token } = req.params
  const user = await getUserByToken(token, res)
  if (user) {
    res.json({ msg: 'Valid User and Token' })
  }
}
const newPassword = async (req, res) => {
  const { token } = req.params
  const { password } = req.body
  const user = await getUserByToken(token, res)
  if (user) {
    user.password = password
    user.confirmed = true
    user.token = null
    try {
      await user.save()
    } catch (error) {
      console.log(error)
    }

    res.json({ msg: 'Password Saved Successfully.' })
  }
}

const profile = async (req, res) => {
  const { user } = req
  res.json(user)
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
