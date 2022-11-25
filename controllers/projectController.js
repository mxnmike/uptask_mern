import Project from '../models/Project.js'
import User from '../models/User.js'
import {
  validateObjectId,
  sendError,
  sendSuccess,
} from '../helpers/helperFunctions.js'
import Task from '../models/Task.js'

const newProject = async (req, res) => {
  const project = new Project(req.body)
  try {
    validateObjectId(req.user._id)
    project.owner = req.user._id
    const storedProject = await project.save()
    res.json(storedProject)
  } catch (error) {
    sendError(res, error)
    return
  }
}

const getProject = async (req, res) => {
  const { id } = req.params
  try {
    validateObjectId(id)
    const project = await Project.findById(id)
      .select('-createdAt -__v -updatedAt')
      .populate('tasks', '-createdAt -__v -updatedAt')
      .populate('collaborators', 'name email')

    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }

    if (
      project.owner.toString() !== req.user._id.toString() &&
      !project.collaborators.some(
        collaborator => collaborator._id.toString() === req.user._id.toString()
      )
    ) {
      throw { code: 401, message: 'Invalid Action' }
    }

    const tasks = await Task.find()
      .where('project')
      .equals(project._id)
      .select('-__v')
    return res.json({ statusCode: 200, project, tasks })
  } catch (error) {
    sendError(res, error)
  }
}

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find({
      $or: [{ collaborators: { $in: req.user } }, { owner: { $in: req.user } }],
    }).select('-tasks -__v')
    if (!projects) {
      throw { code: 404, message: 'Projects Not Found' }
    }
    res.json({ statusCode: 200, projects })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const editProject = async (req, res) => {
  const { id } = req.params
  try {
    validateObjectId(id)
    const project = await Project.findById(id)

    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Invalid Action' }
    }

    console.log('Body Tasks', req.body.tasks)
    project.name = req.body.name || project.name
    project.description = req.body.description || project.description
    project.dueDate = req.body.dueDate || project.dueDate
    project.client = req.body.client || project.client
    project.tasks = req.body.tasks || project.tasks

    const updatedProject = await project.save()
    res.json({ statusCode: 200, updatedProject })
  } catch (error) {
    sendError(res, error)
    return
  }
}
const deleteProject = async (req, res) => {
  const { id } = req.params
  try {
    validateObjectId(id)

    const project = await Project.findById(id)

    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Invalid Action' }
    }

    await project.deleteOne()
    sendSuccess(res, { message: 'Deleted Project' })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const getTasks = async (req, res) => {
  const { id } = req.params
  try {
    validateObjectId(id)

    const project = await Project.findById(id)
    console.log(project)
    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }

    const tasks = await Task.find().where('project').equals(id).select('-__v')
    res.json({ statusCode: 200, tasks })
  } catch (error) {
    sendError(res, error)
    return
  }
}
// SECTION: - COLLABORATORS
const addCollaborator = async (req, res) => {
  const { email } = req.body
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Invalid Action' }
    }

    const user = await User.findOne({ email }).select(
      '-confirmed -createdAt -password -token -__v -updatedAt'
    )
    if (!user) {
      throw { code: 404, message: 'User Not Found' }
    }

    if (project.owner.toString() === user._id.toString()) {
      throw { code: 401, message: 'Project Owner cannot be Collaborator' }
    }

    if (project.collaborators.includes(user._id)) {
      throw {
        code: 401,
        message: 'User is already Collaborator in this project',
      }
    }

    project.collaborators.push(user._id)
    await project.save()
    sendSuccess(res, { message: 'Collaborator Added Successfully' })
  } catch (error) {
    sendError(res, error)
  }
}

const searchCollaborator = async (req, res) => {
  const { email } = req.body

  try {
    const user = await User.findOne({ email }).select(
      '-confirmed -createdAt -password -token -__v -updatedAt'
    )
    if (!user) {
      throw { code: 404, message: 'User Not Found' }
    }

    res.json({ statusCode: 200, user })
  } catch (error) {
    sendError(res, error)
  }
}
const deleteCollaborator = async (req, res) => {
  try {
    const project = await Project.findById(req.params.id)
    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }
    if (project.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Invalid Action' }
    }

    project.collaborators.pull(req.body.id)
    await project.save()
    sendSuccess(res, { message: 'Collaborator Removed Successfully' })
  } catch (error) {
    sendError(res, error)
  }
}

export {
  newProject,
  getProject,
  getProjects,
  editProject,
  deleteProject,
  addCollaborator,
  searchCollaborator,
  deleteCollaborator,
  getTasks,
}
