

const priorityCond = {
  $switch : {
    branches: [
      {
        case: {$eq: ['$priority', 1]}, then: 'Low'
      },
      {
        case: {$eq: ['$priority', 2]}, then: 'Medium'
      },
      {
        case: {$eq: ['$priority', 3]}, then: 'High'
      },
    ],
    default: 'Unassigned'
  }
  // $cond: { 
  //   if : { 
  //     $eq :['$priority', 1]
  //   }, then: 'Low', else: {
  //     $cond: {
  //       if : {
  //         $eq: ['$priority',2]
  //       },then: 'Medium', else: 'High'
  //     }
  //   }
  // }
}


const statusCond = {
  $switch : {
    branches: [
      {
        case: {$eq: ['$status', 1]}, then: 'Pending'
      },
      {
        case: {$eq: ['$status', 2]}, then: 'In-progress'
      },
      {
        case: {$eq: ['$status', 3]}, then: 'Completed'
      },
      {
        case: {$eq: ['$status', 4]}, then: 'Deleted'
      },
    ],
    default: 'Unassigned'
  }
  // $cond: { 
  //   if : { 
  //     $eq :['$status', 1]
  //   }, then: 'Pending', else: {
  //     $cond: {
  //       if : {
  //         $eq: ['$status', 2]
  //       },then: 'In-progress', else: {
  //         $cond: {
  //           if : {
  //             $eq: ['$status', 3]
  //           },then: 'Completed', else: 'Deleted'
  //         }
  //       }
  //     }
  //   }
  // }
}


export {
  priorityCond,
  statusCond
}