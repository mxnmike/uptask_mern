import express from 'express'
import dotenv from 'dotenv'
import cors from 'cors'
import connectDB from './config/db.js'
import userRoutes from './routes/userRoute.js'
import projectRoutes from './routes/projectRoutes.js'
import taskRoutes from './routes/taskRoutes.js'

dotenv.config()

const app = express()
app.use(express.json())
const PORT = process.env.PORT || 4000

connectDB()
const whiteList = [process.env.FRONTEND_URL]

const corsOptions = {
  origin: function (origin, callback) {
    if (whiteList.includes(origin)) {
      callback(null, true)
    } else {
      callback(new Error('Cors Error'))
    }
  },
}
app.use(cors(corsOptions))
//Routing
app.use('/api/users', userRoutes)
app.use('/api/projects', projectRoutes)
app.use('/api/tasks', taskRoutes)

const server = app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`)
})

//Socket.io
import { Server } from 'socket.io'
const io = new Server(server, {
  pingTimeout: 60000,
  cors: { origin: process.env.FRONTEND_URL },
})

io.on('connection', socket => {
  console.log('connected to Socket.io')
  //Define Socket.io Events

  socket.on('open project', project => {
    console.log('room:', project)
    socket.join(project)
  })

  socket.on('new task', task => {
    const project = task.project
    console.log('project:', project)
    socket.to(project).emit('added task', task)
  })
})
