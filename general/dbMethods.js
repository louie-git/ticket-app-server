

const priorityCond = {
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
}


const statusCond = {
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


export {
  priorityCond,
  statusCond
}