const { increaseCartItems, decreaseCartItems, createCart, getProduct, viewCartItems, totalNumberCartItems } = require("../db/user.db");
const { formatServerError, badRequest } = require("../helpers/error");

//logic to add a product to the cart
const newCart = async (req, res)=>{
  const userId = req.user.id
  const productId = req.params.id
  try {
    const getProductById = await getProduct(productId)
    
    const freshCart = await createCart(userId, getProductById.ProductID, getProductById.ProductID, getProductById.price) 

    return res.status(200).json(freshCart)
    
  } catch (error) {
    console.log(error)
    return badRequest(res, "server error")
  }


}
const increase_Item_Quantity = async (req, res) => {
  const userId = req.user.id;
  const productId = req.params.id;
  const { amount } = req.body;

  try {
    const addedItems = await increaseCartItems(userId, productId, amount);

    if (!addedItems) {
      return res.status(400).json({ error: 'Product quantity could not be increased' });
    }

    res.status(200).json({
      message: 'Product quantity increased successfully',
      addedItems: addedItems,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


const decrease_item_quantity = async(req, res)=>{
    const userId =  req.user.id;
    const productId = req.params.id
    const  amount = req.body;
    try {
       const removeItems = await decreaseCartItems(userId, productId, amount ) 
       if(!removeItems){
           return badRequest(res, 'product quantity could not be decreased! ')
       }

       res.status(200).json({
        removeItems
       })
       return;


    } catch (error) {
        console.error(error)
        return formatServerError(res, 'server error')
    }

    

};


const viewCart= async(req, res)=>{
const userId = req.user.id
try {
  const view = await viewCartItems(userId)
  if(!view){
    return badRequest('no product in cart found ')
  }
  res.status(200).json({
    view
  })
  return
} catch (error) {
  console.error(error)
  return formatServerError(res, "server error")
}
  
}

const getTotalCartItems = async (req, res)=>{
  const userId = req.user.id

  try {
    const total = await totalNumberCartItems(userId)

    return res.status(200).json({
      total
    })
  } catch (error) {
    console.error(error)
    return formatServerError()
  }
}
module.exports={
  getTotalCartItems,
  newCart,
  viewCart,
increase_Item_Quantity,
decrease_item_quantity
};