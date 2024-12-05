import Designation from "../models/Designation.js";

const seed = async () => {

  //add validation here

  try {
    await Designation.create([
      {
        key: 10,
        name: 'End User 1',
        is_active: true
      },
      {
        key: 11,
        name: 'Backend Devloper 2',
        is_active: true
      }
    ])
  } catch (error) {
    process.exit(1)
  }
}


export default seed