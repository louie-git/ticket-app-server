import Category from '../models/CategoryModel.js'


async function getCategories(req,res) {
  try {
    const categories = (await Category.find({})).map(category => {
      return {
        key: category.key,
        name: category.name
      }
    })



    res.status(200).send(categories)
  } catch (error) {
    res.status(400).send({message: 'Error while fetching data.'})
  }
}

async function postCategory(req,res){
  

  try {
  
    const key = await Category.find().count() + 1
    console.log(req.body)
    const category = new Category({
      name: req.body.category,
      key
    })

    await category.save()
    res.status(200).send({message: 'Category added successfully.'})
  } catch (error) {
    console.log(error)
    res.status(400).send({message: 'Error while creating new category'})
  }

  

}

export {
  getCategories,
  postCategory
}