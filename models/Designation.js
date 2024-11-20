
import mongoose from 'mongoose'

const Schema = mongoose.Schema

const designationSchema = new Schema({
  key: {
    type: Number,
    require: true
  },
  name: {
    type: String,
    require: true
  },
  is_active:{
    type: Boolean,
    default: false
  }
}, {timestamps: true})

export default mongoose.model('Designation', designationSchema)