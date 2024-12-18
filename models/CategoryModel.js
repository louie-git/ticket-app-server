
import mongoose from 'mongoose'

const Schema = mongoose.Schema


const categorySchema = new Schema ({
  name: {
    type: String,
    required: true
  },
  key: {
    type: Number,
    required: true
  },
  is_active:{
    type: Boolean,
    default: false
  }
}, {timestamps: true})

export default mongoose.model('Category', categorySchema)