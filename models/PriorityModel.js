import mongoose from 'mongoose'

const Schema = mongoose.Schema

const priorityModel = new Schema ({
  item_id : {
    type: Number,
    required:  true
  },
  name : {
    type: String,
    required: true
  }
}, {timestamps: true})

export default mongoose.model('Priority', priorityModel)