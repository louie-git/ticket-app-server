

import Designation from "../models/Designation.js";
import Sanitize from "../helpers/SanitizeString.js"

async function getDesignations (req,res) {

  try {
    const designations = (await Designation.find({})).map( designation => {
      return {
        key: designation.key,
        name: designation.name,
        is_active: designation.is_active
      }
    })

    res.status(200).send(designations)
  } catch (error) {
    res.status(500).send({mesage: 'Error while fetching data.'})
  }
}



async function getActiveDesignation (req,res) {

  try {
    const designation = await Designation.aggregate([
      {
        $match: {"is_active" : true}
      },
      {
        $project: {
          "name": 1,
          "key": 1,
        }
      }
    ])
    res.status(200).send(designation)
  } catch (error) {
    console.log(error)
    res.status(500).send({message: 'Error while fetching designation'})
  }
}

async function post(req, res) {

  try {
    const key = (await Designation.find({})).length + 1
    await Designation.create({
      name: Sanitize(req.body.name),
      key
    })
    res.status(200).send({message: 'Added successfully'})
  } catch (error) {
    res.status(500).send({message: 'Error while creating data.'})
  }

}

async function updateDesignation (req, res){ 

  try {
    const designation = await Designation.findOne({key: req.params.id})
    designation.name = Sanitize(req.body.name)
    designation.save()
    res.status(200).json({message: 'Designation name updated successfully.'})
  } catch (error) {
    res.status(500).json({messaeg: 'Error while updating designation.'})
  }
}


async function toggleIsActive (req, res){ 
  try {
    const designation = await Designation.findOne({key: req.body.key})
    designation.is_active =  !designation.is_active
    designation.save()
    res.status(200).json({message: 'Designation updated successfully.'})
  } catch (error) {
    res.stauts(500).json({messaeg: 'Error while updating designation.'})
  }
}



export {
  getDesignations,
  getActiveDesignation,
  post,
  updateDesignation,
  toggleIsActive
}