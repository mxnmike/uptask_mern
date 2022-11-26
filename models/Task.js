import mongoose, { Types } from 'mongoose'

const taskSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    state: { type: Boolean, default: false },
    dueDate: { type: Date, default: Date.now() },
    priority: { type: String, required: true, enum: ['Low', 'Medium', 'High'] },
    project: { type: Types.ObjectId, ref: 'Project' },
    completed: { type: Types.ObjectId, ref: 'User' },
  },
  { timestamps: true }
)

const Task = mongoose.model('Task', taskSchema)

export default Task
