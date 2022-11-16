import Task from '../models/Task.js'
import Project from '../models/Project.js'
import { validateObjectId, sendError } from '../helpers/helperFunctions.js'

const validateTaskAndProject = async taskId => {}

const newTask = async (req, res) => {
  try {
    const { project } = req.body

    validateObjectId(project, res)
    const foundProject = await Project.findById(project)

    if (!foundProject) {
      throw { code: 404, message: 'Task not Project Not Found' }
    }

    if (foundProject.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Dont have permissions to add Tasks' }
    }

    const task = await Task.create(req.body)
    res.json(task)
  } catch (error) {
    sendError(res, error)
  }
}

const getTask = async (req, res) => {
  try {
    const { id } = req.params
    validateObjectId(id)
    const task = await Task.findById(id).populate('project')

    if (!task) {
      throw { code: 404, message: 'Task not Found' }
    }

    if (task.project.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Invalid Action' }
    }
    return res.json(task)
  } catch (error) {
    sendError(res, error)
  }
}

const editTask = async (req, res) => {
  try {
    const { id } = req.params

    validateObjectId(id, res)

    const task = await Task.findById(id).populate('project')

    if (!task) {
      throw { code: 404, message: 'Task not Found' }
    }

    if (task.project.owner.toString() !== req.user._id.toString()) {
      throw { code: 403, message: 'Invalid Action' }
    }

    task.name = req.body.name || task.name
    task.description = req.body.description || task.description
    task.dueDate = req.body.dueDate || task.dueDate
    task.priority = req.body.priority || task.priority

    const updatedTask = await task.save()
    res.json(updatedTask)
  } catch (error) {
    sendError(res, error)
  }
}

const deleteTask = async (req, res) => {
  try {
    const { id } = req.params

    const project = await Project.findById(id)

    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Invalid Action' }
    }

    await project.deleteOne()
    res.json({ msg: 'Deleted Project' })
  } catch (error) {
    sendError(res, error)
  }
}
const changeState = async (req, res) => {}

export { newTask, getTask, editTask, deleteTask, changeState }
