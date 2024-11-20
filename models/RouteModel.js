import mongoose from 'mongoose'

const Schema = mongoose.Schema

const pageSchema = new Schema({
  path: {
    type: String,
    required: true,
    unique: true
  },
  name: {
    type: String,
    require: true,
    unique: true
  },
  designations: {
    type: Array,
    default: []
  }
}, {timestamps: true})

export default mongoose.model('Page', pageSchema)