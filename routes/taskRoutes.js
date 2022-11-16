import express from 'express'

import {
  newTask,
  getTask,
  editTask,
  deleteTask,
  changeState,
} from '../controllers/taskController.js'

import checkAuth from '../middleware/checkAuth.js'

const router = express.Router()

router.post('/', checkAuth, newTask)

router
  .route('/:id')
  .put(checkAuth, editTask)
  .delete(checkAuth, deleteTask)
  .get(checkAuth, getTask)

router.post('/state/:id', checkAuth, changeState)

export default router
