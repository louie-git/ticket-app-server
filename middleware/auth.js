
import User from '../models/UserModel.js'
import { hashPassword, comparePassword } from '../general/bcrypt.js'
import jwt from 'jsonwebtoken'


function generateAccessToken(id) {
  return jwt.sign({id: id}, process.env.ACCESS_TOKEN_SECRET, {expiresIn: '1d'})
}


const fnRefreshToken = async (req, res) => {

  const refreshToken = req.body.refreshToken
  if(!refreshToken) return res.status(401).send({message: 'Unauthorized'})
    
  // const user = await User.findOne({refreshToken})

  jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, async (err, decoded) => {
    if(err) {
      res.status(400).send({message: 'Unauthorized'})
      return
    }
    const accessToken = generateAccessToken(decoded.id)
    res.status(200).send({accessToken})
    // const user_id = decoded.id
    // const user = await User.findById(user_id)
    // req.user = user
    // res.send({message:'hsdf'})
  })
}


const authenticateUser = async ( req, res ) => {

  try {
    const user = await User.aggregate([
      {
        $match: {email: req.body.email}
      },
      {
        $lookup: {
          from: 'designations',
          localField: 'designation',
          foreignField: 'key',
          as: 'designation'
        }
      },
      {
        $unwind: {
          path: '$designation',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $project: {
          'first_name': 1,
          'last_name': 1,
          'password':1,
          'full_name': {
            $concat: ['$first_name', ' ', '$last_name']
          },
          'designation': '$designation.name',
          'email': 1,
          'createdAt': {
            $dateToString : {
              format: "%Y-%m-%d", date: "$createdAt"
            }
          }
        }
      }
    ]).then(data => data[0])

    if(!user) return res.status(403).send({message: 'Email not found.'})
    if(!await comparePassword(req.body.password, user.password)) return res.status(401).send({message: 'Invalid email or password.'}) 
    if(user.status === 0 ) return res.status(401).send({message: 'Account is currently disabled. Please contact IT Team.'})

    const accessToken = generateAccessToken(user._id)
    // const refreshToken = jwt.sign({id: user._id}, process.env.REFRESH_TOKEN_SECRET, {expiresIn: '1d'})
    // user.refreshToken = refreshToken
    // await user.save()
    delete user['password']
    let routes = []
    if(user.designation !== 1){
      routes = [
        {
          path:'/dashboard',
          name: 'Dashboard'
        }, 
        {
          path:'/tickets',
          name: 'Tickets'
        }, 
        {
          path:'/users',
          name: 'Users'
        }, 
        {
          path:'/developers',
          name: 'Developers'
        }, 
        {
          path:'/account',
          name: 'Account'
        }, 
        {
          path:'/settings',
          name: 'Settings'
        }, 
        {
          path:'/my-tickets',
          name: 'My Tickets'
        }
      ]
    }
    else {
      routes = [
        {
          path:'/my-tickets',
          name: 'My Tickets'
        },
        {
          path:'/account',
          name: 'Account'
        }, 
      ]
    }

    res.status(200).send({accessToken, user, routes})
  } catch (error) {
    res.status(500).send({message: 'Error occurs while logging in.', error: error.message})
  }
}

const authorizeUser = async (req, res, next) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  if(!token) return res.status(401).send({message: 'Unauthorized'})
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if(err) {
      res.status(401).send({message: 'Unauthorized'})
      return
    }
    const user_id = decoded.id
    const user = await User.findById(user_id)
    req.user = user
    next()
  })
} 


const verifyAdmin = async (req, res, next) => {  //Verify routes that only admin is allowed.
  if(req.user.designation !== 1) next()
  else return res.status(401).send({message: 'Unauthorized'})
}

const logout = (req, res) => {
  const authHeader = req.headers.authorization
  const token = authHeader && authHeader.split(' ')[1]
  if(!token) return res.status(401).send({message: 'Unauthorized'})
  jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, async (err, decoded) => {
    if(err) {
      res.status(401).send({message: 'Unauthorized'})
      return
    }
    const user_id = decoded.id
    const user = await User.findById(user_id)
    user.refreshToken = ''
    res.send({message:'Logged out.'})
  })
}


export {
  authenticateUser,
  authorizeUser,
  fnRefreshToken,
  verifyAdmin,
  logout
}