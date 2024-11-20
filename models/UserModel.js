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
    type: Number,
    default: 1
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
  },
  refreshToken: {
    type: String,
    default: ''
  },
  isAdmin: {
    type: Boolean,
    default: false
  }
},{timestamps: true})


export default mongoose.model('User', userSchema)