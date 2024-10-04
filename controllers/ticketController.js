import Ticket from '../models/TicketModel.js'
import mongoose from 'mongoose';
import { priorityCond, statusCond } from '../general/dbMethods.js';

async function getTickets(req,res){

  const limit = 5
  const page = req.query.page ? req.query.page : 1

console.log(req.query.status)
  console.log(page,req.query.status)
  console.log('he',typeof req.query.search)

  const objStatusFilter = {"status": parseInt(req.query.status)}
  const objPrioFilter = {"priority": parseInt(req.query.priority)}
  const arrAndOptFilters = []

  const orOpt = {
    $or: [
      { "submitted_by.full_name": {$regex: req.query.search, $options: 'i'  } },
      {"ticket_number":{$regex: req.query.search, $options: 'i'  }},
      { "description": {$regex: req.query.search, $options: 'i'  } },
      { "category": {$regex: req.query.search, $options: 'i' } },
    ]
  }


  if (req.query.status && req.query.status !== 'All')  arrAndOptFilters.push(objStatusFilter)
  if ( req.query.priority && req.query.priority !== 'All')  arrAndOptFilters.push(objPrioFilter)
  req.query.search && arrAndOptFilters.push(orOpt)

  console.log(arrAndOptFilters)
  const matchOpt = {
    $match: {
      $and:  [...arrAndOptFilters]
    }
  }

  const lookupOpt = {
    $lookup: {
      from: 'users',
      localField: 'submitted_by',
      foreignField: '_id',
      as: 'submitted_by'
    }
  }
  const lookupCategory = {
    $lookup: {
      from: 'categories',
      localField: 'category',
      foreignField: 'key',
      as: 'category'
    }
  }

  const unwindOpt = {
    $unwind: {
      path: '$submitted_by',
      preserveNullAndEmptyArrays: true
    }
  }

  const unwindCategory = {
    $unwind : {
      path: '$category',
      preserveNullAndEmptyArrays: true
    }
  }

  const projectOpt = {
    $project: {
      '_id': 1,
      "ticket_number": 1,
      "category": '$category.name',
      "description": 1,
      "createdAt": {
        $dateToString : {
          format: "%Y-%m-%d", date: "$createdAt"
        }
      },
      "submitted_by": {
        "full_name": {$concat : ['$submitted_by.first_name', " ", "$submitted_by.last_name"]},
        'email': 1,
        "designation": 1
      },  
      "priority": priorityCond,
      "status": statusCond
    },
  }

  const skipOpt =  { $skip:  (limit *  (page - 1)) }

  const limitOpt = { $limit: limit }

  const pipeline = [lookupOpt, lookupCategory, unwindOpt, unwindCategory]

  //Push Match Operator when arrAndOptFilter is not empyty
  arrAndOptFilters.length && pipeline.push(matchOpt) 


  pipeline.push(projectOpt)
  //Fetch data count before applying limit and skip
  const total_tickets = (await Ticket.aggregate(pipeline)).length
  pipeline.push(skipOpt,limitOpt)

  const tickets = await Ticket.aggregate(pipeline)

  // setTimeout(() => {
    res.status(200).json({tickets, total_tickets})
    // res.status(400).json({message: 'Error while fetching data'})
  // }, 3000);

} 

async function getTotalTickets (req,res) {
  const total_tickets = await Ticket.find().count()
  res.status(200).json(total_tickets)
}

async function postTicket (req,res) {
  return res.status(400).send({message: 'Error while uploading'})
  try {
    //creates the leading '000' in the ticket Number
    const ticketCount = await Ticket.find({}).count()
    const pad = '000000'
    let ticket_number = pad.substring( ticketCount.toString().length ) + (ticketCount + 1)
    
    const ticket = new Ticket({
      ticket_number,
      category: req.body.category,
      description: req.body.description,
      submitted_by: new mongoose.Types.ObjectId('668bd0c28a525beeaf38c760')
    })

    await ticket.save()
    res.status(200).json({message: 'Ticket uploaded'})
  } catch (error) {
    console.log(error)
    res.status(400).json({message: 'Failed to create tickets'})
  }
}

async function getTicketID(req,res){
  const ticket = await Ticket.aggregate([
    {
      $match: {ticket_number: req.params.id}
    },
    {
      $lookup : {
        from: 'users',
        localField: 'assignee',
        foreignField: '_id',
        as: 'assignee'
      }
    },
    {
      $lookup: {
        from: 'users',
        localField: 'submitted_by',
        foreignField: '_id',
        as: 'submitted_by'
      }
    },
    {
      $unwind: {
        path: '$submitted_by',
        preserveNullAndEmptyArrays: true
      }
    },
    {
      $project: {
        // full_name: '$submitted_by.$first_name $submitted.$last_name'
        '_id': 1,
        "ticket_number": 1,
        "category": 1,
        "description": 1,
        "status": 1,
        "priority": 1,
        "createdAt": {
          $dateToString : {
            format: "%Y-%m-%d", date: "$createdAt"
          }
        },
        "submitted_by": {
          "full_name": {$concat : ['$submitted_by.first_name', " ", "$submitted_by.last_name"]},
          'email': 1,
          "designation": 1
        },
        "assignee" : 1
      }
    },
  ]).then(data => data[0])
  
  console.log(ticket)
   res.status(200).json(ticket)
    
}

async function updateTicket (req, res) {

  try {
    const id = req.params.id
    const ticket = await Ticket.findOne({'ticket_number':id}).exec()
    ticket.status = req.body.status
    ticket.priority = req.body.priority
    ticket.assignee = req.body.assignee
    await ticket.save()
    res.status(200).json({message: 'Ticket updated successfully.'})

  } catch (error) {
    console.log(error)
    res.status(400).json({message: 'Error while updating ticket'})
  }
} 


const getDevTickets = async (req, res) => {

 try {
  const tickets = await Ticket.aggregate([
    {
      $match: {
        "assignee" : {$in: [new mongoose.Types.ObjectId('668ce7038a525beeaf38c76e')]}
      }
    }
  ])

  res.status(200).json(tickets)
 } catch (error) {
  console.log(error)
  res.status(400).json({message: 'Error while fetching'})
 }
}


const dashboardData = async (req,res) => {


  const completedMatchOpt =   { $match: {'status' : 3} }
  const inprogressMatchOpt =   { $match: {'status' : 2} }

  const sortOpt = { $sort : {"updatedAt" : -1}}
  const limitOpt = { $limit : 5}
  const lookUpOpt = {
    $lookup : {
      from: 'users',
      localField: 'submitted_by',
      foreignField: '_id',
      as: 'submitted_by'
    }
  }
  const unwindOpt = {
    $unwind: {
      path: '$submitted_by',
      preserveNullAndEmptyArrays: true
    }
  }

  const projectOpt = {
    $project: {
      "ticket_number": 1,
      "submitted_by": 1,
      "submitted_by": {
        "full_name" : { $concat : ['$submitted_by.first_name', " ", "$submitted_by.last_name"] }
      },
      "priority" : priorityCond,
    }
  }

  const completedPipeline = [completedMatchOpt,sortOpt, limitOpt, lookUpOpt, unwindOpt, projectOpt]
  const inprogressPipeline = [inprogressMatchOpt,sortOpt, limitOpt, lookUpOpt, unwindOpt, projectOpt]

  try{

    const completedTickets = await Ticket.aggregate(completedPipeline)
    const inprogressTickets = await Ticket.aggregate(inprogressPipeline)


    const tickets = await Ticket.aggregate([
      {
        $group: {
          "_id": statusCond,
          "count" : {$sum: 1},
        }
      },
      {
        $unwind: {
          path: "$_id",
          preserveNullAndEmptyArrays: true
        }
      }
    ])

    const ticketCount = {}
    tickets.forEach(ticket => ticketCount[`${ticket._id}`] = ticket.count )

    console.log(ticketCount['In-progress'])
    //  setTimeout(()=> {
      res.send({
        completed: completedTickets, 
        inprogress: inprogressTickets, 
        completed_count: ticketCount['Completed'],
        pending_count: ticketCount['Pending'],
        inprogress_count: ticketCount['In-progress'],
        total_tickets: ticketCount['Completed'] + ticketCount['Pending'] + ticketCount['In-progress']
      })
    // }, 3000)

  } catch (error) {
    console.log(error)
  }
}

export  {
  getTickets,
  getTotalTickets,
  postTicket,
  getTicketID,
  updateTicket,
  getDevTickets,
  dashboardData
}