import { Types, mongo } from 'mongoose'
const { ObjectId } = Types
const { MongoError } = mongo

export const validateObjectId = id => {
  if (!ObjectId.isValid(id)) {
    throw { code: 400, message: `Invalid ObjectId: ${id}.` }
  }
}

export const sendError = (res, e) => {
  console.log(e)
  if (e instanceof MongoError) {
    console.error(e)
    res.status(400).send({
      code: e.code,
      message: e.code === 11000 ? 'Duplicated Value' : 'Error',
    })
    return
  }

  const statusCode = e.code || 500
  res.status(statusCode).send({
    statusCode: statusCode,
    message: e.message,
  })
}

export const sendSuccess = (res, success) => {
  console.log(success)
  const statusCode = success.code || 200
  res.status(statusCode).send({
    statusCode: statusCode,
    message: success.message,
  })
}

export const sendObject = (res, object) => {
  console.log(object)
  const statusCode = object.code || 200
  res.status(statusCode).send({
    statusCode: statusCode,
    object,
  })
}
