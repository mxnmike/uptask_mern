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

const validateTaskProjectOwnerAndCollaborators = async (taskId, req, res) => {
  validateObjectId(taskId, res)

  const task = await Task.findById(taskId).populate('project')

  if (!task) {
    throw { code: 404, message: 'Task not Found' }
  }

  const userId = req.user._id
  const { project } = task
  const { collaborators } = project

  if (
    project.owner.toString() !== userId.toString() &&
    !collaborators.some(
      collaborator => collaborator._id.toString() === userId.toString()
    )
  ) {
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
    res.json({
      statusCode: 200,
      message: 'Task Saved Successfully',
      task: updatedTask,
    })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const deleteTask = async (req, res) => {
  const { id } = req.params

  try {
    const task = await validateTaskAndProjectOwner(id, req.user._id, res)

    const project = await Project.findById(task.project)
    project.tasks.pull(task._id)

    await Promise.allSettled([project.save(), task.deleteOne()])

    sendSuccess(res, { message: 'Task was Deleted Successfully' })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const changeState = async (req, res) => {
  const { id } = req.params

  try {
    const task = await validateTaskProjectOwnerAndCollaborators(id, req, res)
    task.state = !task.state
    task.completed = req.user._id
    await task.save()
    const updatedTask = await Task.findById(id)
      .select('-__v -updatedAt -createdAt')
      .populate('project', '-__v -updatedAt -createdAt')
      .populate('completed', '_id name email')
    res.json({
      statusCode: 200,
      message: 'Task Updated Successfully',
      task: updatedTask,
    })
  } catch (error) {
    sendError(res, error)
    return
  }
}

export { newTask, getTask, editTask, deleteTask, changeState }
