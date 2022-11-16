import Project from '../models/Project.js'
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
    const project = await Project.findById(id).select('-__v')
    if (!project) {
      throw { code: 404, message: 'Project Not Found' }
    }

    if (project.owner.toString() !== req.user._id.toString()) {
      throw { code: 401, message: 'Invalid Action' }
    }

    const tasks = await Task.find()
      .where('project')
      .equals(project._id)
      .select('-__v')
    return res.json({ statusCode: 200, project, tasks })
  } catch (error) {
    sendError(res, error)
    return
  }
}

const getProjects = async (req, res) => {
  try {
    const projects = await Project.find().where('owner').equals(req.user)
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

    project.name = req.body.name || project.name
    project.description = req.body.description || project.description
    project.dueDate = req.body.dueDate || project.dueDate
    project.client = req.body.client || project.client

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
const addCollaborator = async (req, res) => {}
const deleteCollaborator = async (req, res) => {}

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

export {
  newProject,
  getProject,
  getProjects,
  editProject,
  deleteProject,
  addCollaborator,
  deleteCollaborator,
  getTasks,
}
