
import Priority from '../models/PriorityModel.js'



async function getPriorities (req,res) {

  try {
    const priorities = await Priority.find({}).exec()
    res.status(200).json(priorities)
  } catch (error) {
    res.status(400).json({error: 'Internal error.'})
  }
}



async function createPriority(req, res) {
  console.log(req.body)
  const priorityCount = await Priority.find({}).count()

  let item_id = priorityCount +1
  try {
    Priority.create({
      item_id,
      name : req.body.priority
    })
    res.status(200).json({message: 'success'})
  } catch (error) {
    console.log(error)
    res.status(400).json({error: 'Internal error.'})
  }
}




export {
  getPriorities,
  createPriority
}