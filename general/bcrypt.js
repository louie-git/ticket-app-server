import bcrypt from 'bcrypt'


const hashPassword = async (password) => {

    const saltRounds = 10
    let response = await bcrypt.hash(password, saltRounds)
    .then( (hash) => {
      return  {success:true, hash}
    })
    .catch(err => {
      return  {success: false, message: 'Error while hashing password.'}
    });
    return response
}

const comparePassword = async (password, user_password) => {
  const match = await bcrypt.compare(password, user_password);
  if(match) return true
  return false
}



export {
  hashPassword,
  comparePassword
}