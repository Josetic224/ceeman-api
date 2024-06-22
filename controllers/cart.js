const { increaseCartItems, decreaseCartItems, createCart, getProduct, viewCartItems, totalNumberCartItems, getProductWithoutFormat } = require("../db/user.db");
const { formatServerError, badRequest } = require("../helpers/error");

//logic to add a product to the cart
const newCart = async (req, res)=>{
  const userId = req.user.id
  const productId = req.params.id
  const quantity = req.body.quantity || 1
  try {
    const getProductById = await getProductWithoutFormat(productId)
    
    const freshCart = await createCart(userId, getProductById.product.ProductID, quantity, getProductById.product.price) 

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


const viewCart = async (req, res) => {
  const userId = req.user.id;
  try {
    const view = await viewCartItems(userId);
    if (!view || view.length === 0) {
      return res.status(400).json({ error: 'No products in cart found' });
    }

    // Format the prices to include the Naira symbol
    const formattedView = view.map(item => ({
      ...item,
      unitPrice: `₦${item.unitPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    }));

    res.status(200).json({
      cartItems: formattedView
    });
    return;
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


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