const { increaseCartItems, decreaseCartItems, createOrUpdateCart, getProduct, viewCartItems,getProductWithoutFormat, deleteItemsInCart, getTotalAmountInCart, getTotalCartItems, getUserById } = require("../db/user.db");
const { formatServerError, badRequest } = require("../helpers/error");

const newCart = async (req, res) => {
  const userId = req.user.id
  const sessionId = req.cookies.sessionId;
  const productId = req.params.id;
  const quantity = 1;

  try {
    const getProductById = await getProduct(productId);

    const freshCart = await createOrUpdateCart(userId, getProductById.ProductID, quantity, getProductById.price);

    return res.status(200).json({
      message: "Product successfully added to cart",
      freshCart
    });
  } catch (error) {
    console.log(error);
    return res.status(500).json("Server error");
  }
};

const increase_Item_Quantity = async (req, res) => {
  const userId = req.user.id
  // const sessionId = req.cookies.sessionId;
  const cartItemId = req.params.id;
  const { amount } = req.body;

  try {
    const addedItems = await increaseCartItems(userId, cartItemId, amount);

    if (!addedItems) {
      return res.status(400).json({ error: 'Product quantity could not be increased' });
    }

    // Format the unit price to include the Naira symbol
    const formattedAddedItems = {
      ...addedItems,
      unitPrice: `₦${addedItems.unitPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    };

    res.status(200).json({
      message: 'Product quantity increased successfully',
      addedItems: formattedAddedItems,
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error: Cart Item not Found' });
  }
};

const decrease_item_quantity = async (req, res) => {
  const userId = req.user.id
  // const sessionId = req.cookies.sessionId;
  const cartItemId = req.params.id;
  const { amount } = req.body; // Correctly access amount from req.body

  try {
    const removedItems = await decreaseCartItems(userId, cartItemId, amount);

    if (!removedItems) {
      return res.status(400).json({ error: 'Product quantity could not be decreased' });
    }

    // If the item was removed, indicate it in the response
    if (removedItems.message) {
      return res.status(200).json({ message: removedItems.message });
    }

    // Format the unit price to include the Naira symbol if needed
    const formattedRemovedItems = {
      ...removedItems,
      unitPrice: `₦${removedItems.unitPrice.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    };

    res.status(200).json({
      removedItems: formattedRemovedItems
    });

  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


const viewCart = async (req, res) => {
  const userId = req.user.id
  // const sessionId = req.cookies.sessionId;

  try {
    const view = await viewCartItems(userId);

    if (!view || view.length === 0) {
      return res.status(400).json({ error: 'No products in cart found' });
    }

    // Format the prices to include the Naira symbol
    const formattedView = view.map(item => ({
      ...item,
      unitPrice: `₦${(item.unitPrice).toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`
    }));

    // Calculate the total amount
    const totalAmount = view.reduce((total, item) => total + (item.unitPrice * item.quantity), 0);
    const formattedTotalAmount = `₦${totalAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

    res.status(200).json({
      message: "Successfully Fetched Cart items",
      cartItems: formattedView,
      totalAmount: formattedTotalAmount
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};


const totalNumberOfCartItems = async (req, res) => {
  const userId = req.user.id
  // const sessionId = req.cookies.sessionId

  try {
    const total = await getTotalCartItems(userId);

    return res.status(200).json({
      total
    });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ error: 'Server error' });
  }
};
const get_total_amount_in_cart = async (req, res) => {
  const userId = req.user.id // Assuming userId is retrieved from authenticated user
  // const sessionId = req.cookies.sessionId;
  try {
    const totalAmount = await getTotalAmountInCart(userId);

    // Format totalAmount with Naira symbol
    const formattedTotalAmount = `₦${totalAmount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;

    res.status(200).json({ totalAmount: formattedTotalAmount });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};


const delete_cart_item = async (req, res) => {
  const userId = req.user.id;
  const cartItemId = req.params.id; // Assuming cartItemId is accessed from request parameters

  try {
    const result = await deleteItemsInCart(userId, cartItemId);
    res.status(200).json({
      message:"item deleted successfully",
      result
    }); // Send success message or error message if any
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'Server error' });
  }
};



module.exports={
  totalNumberOfCartItems,
  delete_cart_item,
  newCart,
  viewCart,
increase_Item_Quantity,
decrease_item_quantity,
get_total_amount_in_cart
};