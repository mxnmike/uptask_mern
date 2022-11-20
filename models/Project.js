import mongoose, { Types } from 'mongoose'

const projectSchema = mongoose.Schema(
  {
    name: { type: String, trim: true, required: true },
    description: { type: String, trim: true, required: true },
    dueDate: { type: Date, default: Date.now() },
    client: { type: String, trim: true, required: true },
    owner: { type: Types.ObjectId, ref: 'User' },
    tasks: [
      {
        type: Types.ObjectId,
        ref: 'Task',
      },
    ],
    colaborators: [{ type: Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
)

const Project = mongoose.model('Project', projectSchema)

export default Project
