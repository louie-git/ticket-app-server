import Status from "../models/StatusModel.js"

async function getStatus(req,res){

  try {
    const status = await Status.find({}).exec()
    res.status(200).json(status)
  } catch (error) {
    res.status(400).json({error: 'Internal error.'})
  }
}

async function createStatus(req, res) {
  console.log(req.body)
  const statusCount = await Status.find({}).count()

  let item_id = statusCount +1
  try {
    Status.create({
      item_id,
      name : req.body.status
    })
    res.status(200).json({message: 'success'})
  } catch (error) {
    console.log(error)
    res.status(400).json({error: 'Internal error.'})
  }
}



export {
  getStatus,
  createStatus
}