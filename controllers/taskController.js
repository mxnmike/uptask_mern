import Task from '../models/Task.js'
import Project from '../models/Project.js'
import {
  validateObjectId,
  sendError,
  sendSuccess,
} from '../helpers/helperFunctions.js'

const validateTaskAndProjectOwner = async (taskId, userId, res) => {
  validateObjectId(taskId, res)

  const task = await Task.findById(taskId).populate('project')

  if (!task) {
    throw { code: 404, message: 'Task not Found' }
  }

  if (task.project.owner.toString() !== userId.toString()) {
    throw { code: 403, message: 'Invalid Action' }
  }
  return task
}

const newTask = async (req, res) => {
  const { project } = req.body
  try {
    validateObjectId(project, res)
    const foundProject = await Project.findById(project)

    if (!foundProject) {
      throw { code: 404, message: 'Project Not Found' }
    }

    if (foundProject.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Dont have permissions to add Tasks' }
    }

    const task = await Task.create(req.body)
    foundProject.tasks.push(task._id)
    await foundProject.save()
    res.json({ statusCode: 200, task })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const getTask = async (req, res) => {
  const { id } = req.params
  try {
    const task = await validateTaskAndProjectOwner(id, req.user._id, res)

    return res.json({ statusCode: 200, task })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const editTask = async (req, res) => {
  const { id } = req.params

  try {
    const task = await validateTaskAndProjectOwner(id, req.user._id, res)

    task.name = req.body.name || task.name
    task.description = req.body.description || task.description
    task.dueDate = req.body.dueDate || task.dueDate
    task.priority = req.body.priority || task.priority

    const updatedTask = await task.save()
    res.json({ statusCode: 200, updatedTask })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const deleteTask = async (req, res) => {
  const { id } = req.params

  try {
    const task = await validateTaskAndProjectOwner(id, req.user._id, res)
    await task.deleteOne()
    sendSuccess(res, { message: 'Deleted Task' })
  } catch (error) {
    sendError(res, error)
    return
  }
}
const changeState = async (req, res) => {}

export { newTask, getTask, editTask, deleteTask, changeState }
