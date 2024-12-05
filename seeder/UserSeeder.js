

import User from "../models/UserModel.js";
import { hashPassword } from "../general/bcrypt.js";


const seed = async () => {

  try {

    //add validation here

    const hashedPassword = await hashPassword('Testing123!')

    await User.create({
      first_name: 'Admin',
      last_name: 'Testing',
      email: 'admintest@gmail.com',
      password: hashedPassword.hash,
      status: 1,
      designation: 2
    })
    return
  } catch (error) {
    process.exit(1)
  }
}

export default seed