
import User from '../models/UserModel.js'
import Ticket from '../models/TicketModel.js'
import { Types }  from 'mongoose'

async function getUsers (req, res) {
  // const users = await User.find().exec()
  // res.status(200).send(users)
  console.log(req.query)
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
      "full_name" : {$concat : ['$first_name', " ", "$last_name"]}
    }
  }

  req.query.search && pipeline.push(matchOpt)
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


export {
  getUsers,
  createUser,
  getUserById
}