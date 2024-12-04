import Ticket from '../models/TicketModel.js'
import mongoose from 'mongoose';
import { priorityCond, statusCond } from '../general/dbMethods.js';

async function getTickets(req,res){

  // return res.status(500).send({message: 'Error while fetching tickets'})

  const limit = 5
  const page = req.query.page ? req.query.page : 1

  // console.log(req.query.status)
  // console.log(page,req.query.status)
  // console.log('he',typeof req.query.search)

  const objStatusFilter = {"status": parseInt(req.query.status)}
  const objPrioFilter = {"priority": parseInt(req.query.priority)}
  const arrAndOptFilters = []

  const orOpt = {
    $or: [
      { "submitted_by.full_name": {$regex: req.query.search, $options: 'i'  } },
      {"ticket_number":{$regex: req.query.search, $options: 'i'  }},
      { "description": {$regex: req.query.search, $options: 'i'  } },
      { "category": {$regex: req.query.search, $options: 'i' } },
      { "submitted_by.email":{$regex: req.query.search, $options: 'i'  }}
    ]
  }


  if (req.query.status && req.query.status !== 'All')  arrAndOptFilters.push(objStatusFilter)
  if ( req.query.priority && req.query.priority !== 'All')  arrAndOptFilters.push(objPrioFilter)
  req.query.search && arrAndOptFilters.push(orOpt)

  // console.log(arrAndOptFilters)
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

  // console.log(pipeline)
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
  // return res.status(400).send({message: 'Error while uploading'})
  try {
    //creates the leading '000' in the ticket Number
    const ticketCount = await Ticket.find({}).count()
    const pad = '000000'
    let ticket_number = pad.substring( ticketCount.toString().length ) + (ticketCount + 1)
    
    const ticket = new Ticket({
      ticket_number,
      category: req.body.category,
      description: req.body.description,
      submitted_by:  req.user._id
    })

    await ticket.save()
    res.status(200).json({message: 'Ticket uploaded'})
  } catch (error) {
    // console.log(error)
    res.status(400).json({message: 'Failed to create tickets'})
  }
}

async function getTicketID(req,res){

  try {
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
        $lookup: {
          from: 'categories',
          localField: 'category',
          foreignField: 'key',
          as: 'category'
        }
      },
      {
        $unwind: {
          path: '$submitted_by',
          preserveNullAndEmptyArrays: true
        }
      },
      {
        $unwind: {
          path: '$category',
          preserveNullAndEmptyArrays: true
        }
      },
      // {
      //   $unwind: {
      //     path:  '$messages',
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      // {
      //   $lookup : {
      //     from: 'users',
      //     localField: 'messages.created_by',
      //     foreignField: '_id',
      //     as: 'messages.created_by'
      //   }
      // },
      // {
      //   $unwind: {
      //     path: '$messages.created_by' ,
      //     preserveNullAndEmptyArrays: true
      //   }
      // },
      {
        $project: {
          '_id': 1,
          "ticket_number": 1,
          "category": "$category.name",
          "description": 1,
          "status": statusCond,
          "priority": priorityCond,
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
          "assignee" : 1,
          // "messages.created_by" : {
          //   "email" : 1,
          //   "full_name": { $concat: [ "$messages.created_by.first_name", " ", "$messages.created_by.last_name"] }
          // },
          // "messages" : {
          //   "_id": 1,
          //   "message": 1,
          //   "createdAt": 1,
          //   "updatedAt": 1,
          // }
          // "messages": 1
        }
      },
      // {
      //   $group: {
      //     _id: '$_id',
      //     "messages": { $push: '$messages'},
      //     "ticket_number": {$first: '$ticket_number'},
      //     "category": {$first: '$category'},
      //     "description": {$first: '$description'},
      //     "status": {$first: '$status'},
      //     "priority": {$first: '$priority'},
      //     "createdAt": {$first: '$craatedAt'},
      //     "submitted_by": {$first: '$submitted_by'},
      //     "assignee" : {$first: '$assignee'}
      //   }
      // },
    ]).then(data => data[0])

    if(!ticket) return res.status(404).send({message: `Ticket ID ${req.params.id} not found.`})
    res.status(200).send(ticket)
      
  } catch (error) {
    res.status(500).send({message: "Error while fetching ticket info."})
  }
}

async function updateTicket (req, res) {

  try {
    const id = req.params.id
    const ticket = await Ticket.findOne({'ticket_number':id}).exec()
    if(req.body.status) ticket.status = req.body.status
    if(req.body.priority) ticket.priority = req.body.priority
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

async function findUser (req, res) {
  console.log('hee')
  try {
    
    const tickets = await Ticket.aggregate([
      {
        $lookup: {
          "from": "users",     
          "localField": "submitted_by",     
          "foreignField": "_id",     
          "as": "user" 
        }
      },
      {
        $match: {"user.email":{$regex: 'jer', $options: 'i'  }}
      }
    ])
  
    res.status(200).send(tickets)
  } catch (error) {
    console.log(error)
    res.status(500).send({message: 'Error while fetching data.'})
  }
}

async function postMessage (req, res) {
  console.log('comment')
  try {

    await Ticket.updateOne(
      { _id: '668398ad3e509f4b0f47b2f2' },
      {
        $push: { 
          messages: {
            created_by:'668ce7038a525beeaf38c76e',
            message: 'What is it?'
          }
        }
      }
    ) 

    res.status(200).send({message: 'Comment submitted successfully.'})
  } catch (error) {
    console.log(error)
    res.status(500).send({meessage: 'Error while posting comment.'})
  }
}

async function updateMessage(req, res) {
  try {
    const ticket = await Ticket.updateOne(
      { 
        _id: '668398ad3e509f4b0f47b2f2',
        'comments._id': '67231c039b82f609285cfa36'
      },
      {
        $set: {'comments.$.message': 'Damn it works'}
      }
    )
    console.log(ticket)
  } catch (error) {
    console.log(error),
    res.status(500).send({message: 'Error while updating message.'})
  }
}

async function myTickets (req, res) {
  
  try {
    
    const limit =  req.query.limit || 5
    const page = req.query.page || 1
    const pipeline = []

    const matchOpt = {
      $match: {submitted_by : req.user._id}
    }

    const skipOpt = { $skip:  (limit *  (page - 1)) }
    const limitOpt = { $limit: limit }
    const lookupOpt = { 
      $lookup : {
        from : 'users',
        localField : 'submitted_by',
        foreignField : '_id',
        as : 'submitted_by'
      }
    }

    const unwindOpt = { 
      $unwind: {
        path: '$submitted_by',
        preserveNullAndEmptyArrays: true
      }
    }

    const categoryLookupOpt = { 
      $lookup : {
        from : 'categories',
        localField : 'category',
        foreignField : 'key',
        as : 'category'
      }
    }

    const categoryUnwindOpt = { 
      $unwind: {
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

    pipeline.push(matchOpt)
    const total_tickets = (await Ticket.aggregate(pipeline)).length
    pipeline.push(lookupOpt, categoryLookupOpt,unwindOpt, categoryUnwindOpt, projectOpt, skipOpt, limitOpt)

    const tickets = await Ticket.aggregate(pipeline)

    res.status(200).send({tickets, total_tickets})
  } catch (error) {
    console.log(error)
    res.status(500).send({message: 'Error occurs while fetching tickets', error: error.message})
  }
}

export  {
  getTickets,
  getTotalTickets,
  postTicket,
  getTicketID,
  updateTicket,
  getDevTickets,
  dashboardData,
  findUser,
  postMessage,
  updateMessage,
  myTickets
}