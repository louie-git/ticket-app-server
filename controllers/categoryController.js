import Category from '../models/CategoryModel.js'
import Sanitize from '../helpers/SanitizeString.js'

async function getCategories(req,res) {
  try {
    const categories = (await Category.find({})).map(category => {
      return {
        key: category.key,
        name: category.name,
        is_active: category.is_active
      }
    })

    res.status(200).send(categories)
  } catch (error) {
    res.status(400).send({message: 'Error while fetching data.'})
  }
}

async function getActiveCategories (req,res) {

  try {
    const categories = await Category.aggregate([
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
    res.status(200).send(categories)
  } catch (error) {
    res.status(500).send({message: 'Error while fetching categories'})
  }
}

async function postCategory(req,res){
  

  try {
  
    const key = await Category.find().count() + 1
    console.log(req.body)
    const category = new Category({
      name: Sanitize(req.body.name),
      key
    })

    await category.save()
    res.status(200).send({message: 'Category added successfully.'})
  } catch (error) {
    console.log(error)
    res.status(400).send({message: 'Error while creating new category'})
  }

}


async function updateCategory (req, res){ 
  console.log('ehre')

  await new Promise((resolve) => {
    setTimeout(() => resolve(),3000 )
  })
  try {
    const category = await Category.findOne({key: req.params.id})
    category.name = Sanitize(req.body.name)
    category.save()
    res.status(200).json({message: 'Category name updated successfully.'})
  } catch (error) {
    res.stauts(500).json({messaeg: 'Error while updating category.'})
  }
}


async function toggleIsActive (req, res){ 
  try {
    const category = await Category.findOne({key: req.body.key})
    category.is_active =  !category.is_active
    category.save()
    res.status(200).json({message: 'Category updated successfully.'})
  } catch (error) {
    res.stauts(500).json({messaeg: 'Error while updating category.'})
  }
}

export {
  getCategories,
  getActiveCategories,
  postCategory,
  updateCategory,
  toggleIsActive
}