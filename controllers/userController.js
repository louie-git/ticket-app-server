
import User from '../models/UserModel.js'
import Ticket from '../models/TicketModel.js'
import { Types }  from 'mongoose'
import { hashPassword, comparePassword } from '../general/bcrypt.js'



async function getUsers (req, res) {
  // const users = await User.find().exec()
  // res.status(200).send(users)
  try {
    console.log(req.query)
    const limit = 5
    const page = req.query.page ? req.query.page : 1
  
    const pipeline = []
  
    const matchOpt = {
      $match: {
        $or: [
          { 'email': {$regex: req.query.search, $options: 'i'  } },
          { 'first_name': {$regex: req.query.search, $options: 'i'  } },
          { 'last_name': {$regex: req.query.search, $options: 'i' } },
        ]
      }
    }
  
    const projectOpt = {
      $project: {
        "email" : 1,
        "designation": 1,
        "full_name" : {$concat : ['$first_name', " ", "$last_name"]},
        "last_name": 1,
        "first_name": 1,
        "createdAt": {
          $dateToString : {
            format: "%Y-%m-%d", date: "$createdAt"
          }
        },
        "status": {
          $cond: { 
            if : { 
              $eq :['$status', 1]
            }, then: 'Confirmed', else: 'Pending'
          }
        }
      }
    }
  
    const skipOpt =  { $skip:  (limit *  (page - 1)) }
  
    const limitOpt = { $limit: limit }
  
    req.query.search && pipeline.push(matchOpt)
  
    pipeline.push(projectOpt)

    const total_users = (await User.aggregate(pipeline)).length
    

    // console.log('here', total_users)

    pipeline.push(skipOpt,limitOpt)
  
    // console.log(pipeline)
    const users = await User.aggregate(pipeline)
    res.status(200).send({users, total_users})

  } catch (error) {
    console.log(error)
    res.status(500).send({message: 'Error while fetching data'})
  }
}



async function getDevs (req, res) {
  // const users = await User.find().exec()
  // res.status(200).send(users)

  req.query.search = req.query.search ? req.query.search.toString() : ''

  const pipeline = []

  const matchOpt = {
    $match: {
      $or: [
        { 'email': {$regex: req.query.search, $options: 'i'  } },
        { 'first_name': {$regex: req.query.search, $options: 'i'  } },
        { 'last_name': {$regex: req.query.search, $options: 'i' } },
      ],
      'designation' : 'Back-end Developer'
    },
  }

  const projectOpt = {
    $project: {
      "email" : 1,
      "designation": 1,
      "full_name" : {$concat : ['$first_name', " ", "$last_name"]}
    }
  }

  pipeline.push(matchOpt)
  pipeline.push(projectOpt)

  console.log(pipeline)
  const users = await User.aggregate(pipeline)

  res.status(200).send(users)
}


async function createUser (req, res) {

  
  try {
    await User.create({
      // first_name: 'Vincent Louie',
      // last_name: 'Arrabis',
      // designation: 'Back-end Developer',
      // email: 'vincentla@meditab.com'
      first_name: req.body.first_name,
      last_name: req.body.last_name,
      designation: 'Back-end Developer',
      email: req.body.email
    })
    res.status(200).json({message: 'User created successfully.'})
  } catch (error) {
    res.status(400).json({message: 'Failed to create new user.'})
  }
}


async function getUserById (req,res) {
  console.log(req.query)



  const limit = 5
  const page = req.query.page ? req.query.page : 1
  const id =  Types.ObjectId.createFromHexString(req.params.id)
  const objStatusFilter = {"status": parseInt(req.query.status)}
  const objPrioFilter = {"priority": parseInt(req.query.priority)}
  const objDevId = {"_id": id}


  const arrAndOptFilters = []

  arrAndOptFilters.push({"assignee": { $in: [id]}})

  if (req.query.status && req.query.status !== 'All')  arrAndOptFilters.push(objStatusFilter)
  if ( req.query.priority && req.query.priority !== 'All')  arrAndOptFilters.push(objPrioFilter)
    
  try {
    const user = await User.aggregate( [
      {
        $match: { 
            "_id": id
        },
      },
      {
        $project: {
          "_id": 1,
          "full_name" : {$concat : ['$first_name', " ", "$last_name"]},
          "email" : 1,
          "designation" : 1,
        }
      },
    ]).then(data => data[0])


    const pipeline = [    
      { 
        $match: {
          $and: [...arrAndOptFilters]
        }
      },
      {
        $project:{
          "assignee":1,
          "category":1,
          "createdAt": 1,
          "description": 1,
          "submitted_by": 1,
          "ticket_number": 1,
          "updatedAt": 1,
          "_id":1,
          "priority": {
            $cond: { 
              if : { 
                $eq :['$priority', 1]
              }, then: 'Low', else: {
                $cond: {
                  if : {
                    $eq: ['$priority',2]
                  },then: 'Medium', else: 'High'
                }
              }
            }
          },
          "status": {
            $cond: { 
              if : { 
                $eq :['$status', 1]
              }, then: 'Pending', else: {
                $cond: {
                  if : {
                    $eq: ['$status',2]
                  },then: 'In-progress', else: 'Completed'
                }
              }
            }
          }
        }        
      }
    ]
    
    const total_tickets =  (await Ticket.aggregate(pipeline)).length

    pipeline.push(   { $skip:  (limit *  (page - 1)) },
    { $limit: limit })

    const tickets = await Ticket.aggregate(pipeline)
    res.status(200).json({user,total_tickets,tickets})
    
  } catch (error) {
    console.log(error)
    res.status(400).json({message: 'Internal Error.', error})
  }
  
}

async function updateStatus(req,res) {

  try {
    // throw 'd'
    await User.findByIdAndUpdate(req.params.id, {'status': req.body.status})
    res.status(200).json({message: 'Status updated successfully.'})
  } catch (error) {
    res.status(500).json({message: 'Error while updating status'})
  }

}



async function registerUser(req,res) {

  // return res.status(500).json({message: 'Sample Error'})


  const emailVerify = /@./
  const stringCheck= /^[a-zA-Z]+$/

  let text = 'vincentlameditabcom'
  console.log(emailVerify.test(text))
  console.log(stringCheck.test(text))


  return res.send({message: 'Testing only.'})

  try {
    const { 
      first_name,
      last_name,
      email,
      password,
      confirm_password
    } = req.body
    // const password = 'gwapo ko'

    if(password !== confirm_password) res.status(401).json({message: 'Password not match'}) 

    const hashedPassword = await hashPassword(password)

    if(!hashedPassword.success) return res.status(500).json({message: hashedPassword.message})

    // return res.json({hashedPassword})

     await  User.create({
      first_name,
      last_name,
      email,
      password : hashedPassword.hash,
    })

    res.status(200).json({message: 'Account created successfully.'})

  } catch (error) {
    console.log(error)
    res.status(500).send({message: 'Error while creating account. Please contact IT team.'})
  }
}


async function changePassword ( req,res )  {

  let format =  /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/
  let uppercaseFormat = /[A-Z]/
  
  try {
    // const {_id, password, confirm_password} = req.body
  
    let password = 'asdfAsdf!'
    let confirm_password = 'asdfAsdf!'

    if(!format.test(password)) return res.status(400).send({message: 'Password must have special characters.'})
    if(!uppercaseFormat.test(password)) return res.status(400).send({message: 'Password must have uppercase.'})
    if(password.length < 8) return res.status(400).send({message: 'Password must have 8 characters.'})
    if(password !== confirm_password) return res.status(400).send({message: 'Password not match.'})

    const user = await User.findById('6719e2ce4df514e932aaf0bd')
    const confirmed = await comparePassword(password, user.password)
    
    if(!confirmed) return res.status(401).send({message: 'Incorrect password.'})
  
    let hashedPassword = await hashPassword(password)
    if(!hashedPassword.success) return res.status(500).send({message: 'Error while hashing password.'})

    user.password = hashedPassword.hash
    await user.save()
    res.status(200).send({message: 'Password updated successfully.'})
    
  } catch (error) {
    console.log(error)
    res.status(500).send({message: 'Internal error'})
  }

}

export {
  getUsers,
  getDevs,
  createUser,
  getUserById,
  updateStatus,
  registerUser,
  changePassword
}

