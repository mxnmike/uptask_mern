import Project from '../models/Project.js'

const newProject = async (req, res) => {
  const project = new Project(req.body)
  project.owner = req.user._id
  try {
    const storedProject = await project.save()
    res.json(storedProject)
  } catch (error) {
    console.log(error)
  }
}

const getProject = async (req, res) => {
  const { id } = req.params

  console.log('user', req.user)

  const project = await Project.findById(id)
  if (!project) {
    const error = new Error('Project Not Found')
    return res.status(404).json({ msg: error.message })
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    const error = new Error('Invalid Action')
    return res.status(401).json({ msg: error.message })
  }
  return res.json(project)
}

const getProjects = async (req, res) => {
  const projects = await Project.find().where('owner').equals(req.user)
  res.json(projects)
}

const editProject = async (req, res) => {
  const { id } = req.params

  console.log('user', req.user)
  const project = await Project.findById(id)
  if (!project) {
    const error = new Error('Project Not Found')
    return res.status(404).json({ msg: error.message })
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    const error = new Error('Invalid Action')
    return res.status(401).json({ msg: error.message })
  }

  project.name = req.body.name || project.name
  project.description = req.body.description || project.description
  project.dueDate = req.body.dueDate || project.dueDate
  project.client = req.body.client || project.client

  try {
    const updatedProject = await project.save()
    res.json(updatedProject)
  } catch (error) {
    console.log(error)
  }
}
const deleteProject = async (req, res) => {
  const { id } = req.params

  const project = await Project.findById(id)

  if (!project) {
    const error = new Error('Project Not Found')
    return res.status(404).json({ msg: error.message })
  }

  if (project.owner.toString() !== req.user._id.toString()) {
    const error = new Error('Invalid Action')
    return res.status(401).json({ msg: error.message })
  }

  try {
    await project.deleteOne()
    res.json({ msg: 'Deleted Project' })
  } catch (error) {
    console.log(error)
  }
}
const addCollaborator = async (req, res) => {}
const deleteCollaborator = async (req, res) => {}
const getTasks = async (req, res) => {}

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
