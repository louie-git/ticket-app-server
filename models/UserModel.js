import mongoose from 'mongoose'


const Schema = mongoose.Schema

const userSchema = new Schema({
  first_name: {
    type: String,
    required: true
  },
  last_name: {
    type: String,
    required: true
  },
  designation: {
    type: String,
    default: 'End User'
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  status: {
    type: Number,
    default: 0
  }
},{timestamps: true})


export default mongoose.model('User', userSchema)