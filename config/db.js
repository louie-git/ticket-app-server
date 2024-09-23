import mongoose from 'mongoose'

const dbConnect = async() => {
  try {
    const conn = await mongoose.connect(process.env.MONGODB_URI)
    console.log('DB successfully connected : ', conn.connection.host)
  } catch (error) {
    console.error(error)
    process.exit(1)
  }
}

export default dbConnect