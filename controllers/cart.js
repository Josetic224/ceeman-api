const { increaseCartItems, decreaseCartItems, createCart, getProduct } = require("../db/user.db");
const { formatServerError, badRequest } = require("../helpers/error");


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

const increaseItemQuantity = async(req, res)=>{
    const {UserID} = req.user
    const { userId, productId, amount } = req.body;
 

    try {
      const  addedItems =  await increaseCartItems(userId, productId, amount);

      if(!addedItems){
        return badRequest(res , 'product quantity could not be increased')
      }

      res.status(200).json({
        addedItems
      })
      return;

    } catch (error) {
        console.error(error);
        return formatServerError(res,'server error' )
    }
};

const removeItemsToCart = async(req, res)=>{
    const {UserID} =  req.user;
    const {userId, productId, amount} = req.body;
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


const viewCart = async(req, res)=>{
  
}
module.exports={
  newCart,
  increaseItemQuantity,
    removeItemsToCart
};