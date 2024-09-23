import mongoose from "mongoose";

const Schema = mongoose.Schema


const ticketSchema = new Schema({
  ticket_number: {
    type: String,
    required: true
  },
  category: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    default: ''
  },
  submitted_by: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  assignee: [{
    type: Schema.Types.ObjectId,
    ref: 'User'
  }],
  status: {
    type: Number,
    default: 1
  },
  priority: {
    type: Number,
    default: ''
  }
  
},{ timestamps:true })



export default mongoose.model('Ticket', ticketSchema)