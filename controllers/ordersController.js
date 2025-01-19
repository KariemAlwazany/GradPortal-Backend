const Orders = require('../models/ordersModel');
const Cart = require('../models/cartModel');
const Sellers = require('../models/sellerModel');
const Items = require('../models/itemsModel');
const OrderItems = require('../models/orderItemsModel');
const {User} = require('../models/userModel');
const catchAsync = require('../utils/catchAsync');
const jwt = require('jsonwebtoken'); 
const sendEmail = require('../utils/email');
const axios = require('axios');



const createOrder = catchAsync(async (req, res, next) => {
  const userID = req.user.id;
  const { totalPrice, paymentMethod, deliveryLocation, delivery_method } = req.body;

  // Normalize deliveryMethod
  const deliveryMethod = delivery_method || req.body.deliveryMethod;

  console.log(req.body); // Log request body for debugging
  console.log('Delivery Method:', deliveryMethod); // Log delivery method

  // Validate required fields
  if (
    !totalPrice ||
    !paymentMethod ||
    !deliveryMethod ||
    !deliveryLocation ||
    !deliveryLocation.latitude ||
    !deliveryLocation.longitude
  ) {
    return res.status(400).json({ message: 'Invalid order details' });
  }

  try {
    // Use reverse geocoding to get the city
    const geocodingUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${deliveryLocation.latitude},${deliveryLocation.longitude}&key=${process.env.GOOGLE_MAPS_API_KEY}`;
    const geocodingResponse = await axios.get(geocodingUrl);

    if (geocodingResponse.data.status !== 'OK') {
      console.error('Geocoding API error:', geocodingResponse.data);
      return next(new AppError('Failed to get the city from coordinates!', 500));
    }

    const addressComponents = geocodingResponse.data.results[0]?.address_components || [];
    const cityComponent = addressComponents.find((component) =>
      component.types.includes('locality')
    ) || addressComponents.find((component) =>
      component.types.includes('administrative_area_level_1')
    );

    if (!cityComponent) {
      console.error('City not found in geocoding response:', addressComponents);
      return next(new AppError('City not found in geocoding response!', 404));
    }

    const city = cityComponent.long_name;

    // Fetch the user's cart
    const cart = await Cart.findOne({
      where: { user_id: userID },
      include: [
        {
          model: Items,
          as: 'ItemsInCart',
          through: {
            attributes: ['quantity', 'price'],
          },
          attributes: ['Item_ID', 'item_name', 'price', 'description', 'Picture', 'Shop_name'],
        },
      ],
    });

    if (!cart || !cart.ItemsInCart || cart.ItemsInCart.length === 0) {
      return res.status(404).json({ message: 'Cart is empty or not found' });
    }

    // Map shop owners to items in the cart
    for (const item of cart.ItemsInCart) {
      if (item.Shop_name) {
        const seller = await Sellers.findOne({
          where: { shop_name: item.Shop_name },
          attributes: ['id'],
        });
        if (!seller) {
          return res.status(404).json({
            message: `Shop owner for ${item.Shop_name} not found.`,
          });
        }
        item.shopOwnerId = seller.id;
      } else {
        return res.status(400).json({
          message: `Shop name is missing for item ${item.item_name}.`,
        });
      }
    }

    // Create the order with delivery details
    const order = await Orders.create({
      buyer_id: userID,
      total_price: totalPrice,
      payment_method: paymentMethod,
      delivery_method: deliveryMethod, // Use normalized deliveryMethod
      delivery_location: {
        latitude: deliveryLocation.latitude,
        longitude: deliveryLocation.longitude,
      }, // Save delivery location
      city, // Save city dynamically retrieved from Google API
      status: 'pending',
    });

    // Group items by shop owner
    const groupedItems = {};
    for (const item of cart.ItemsInCart) {
      const shopOwnerId = item.shopOwnerId;
      if (!groupedItems[shopOwnerId]) groupedItems[shopOwnerId] = [];
      groupedItems[shopOwnerId].push({
        order_id: order.order_id,
        item_id: item.Item_ID,
        quantity: item.CartItems.quantity,
        price: item.CartItems.price,
      });
    }

    // Notify each shop owner and create OrderItems
    for (const shopOwnerId in groupedItems) {
      const itemsForShopOwner = groupedItems[shopOwnerId];

      // Create order items for the shop owner
      await OrderItems.bulkCreate(itemsForShopOwner);

      console.log(`Shop owner ${shopOwnerId} has received a new order.`);
    }

    res.status(201).json({
      message: 'Order created successfully',
      order,
    });
  } catch (error) {
    console.error('Error creating order:', error);
    res.status(500).json({
      message: 'Failed to create order',
      error: error.message,
    });
  }
});








  const getOrdersForSeller = catchAsync(async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decoded.id;
  
      console.log('Decoded User ID:', userID);
  
      const user = await User.findOne({
        where: { id: userID },
        attributes: ['Username'],
      });
  
      if (!user || !user.Username) {
        return res.status(404).json({ message: 'User not found or username is missing' });
      }
  
      const username = user.Username;
      console.log('User Username:', username);
  
      const shop = await Sellers.findOne({
        where: { Username: username },
        attributes: ['Shop_name'],
      });
  
      if (!shop || !shop.Shop_name) {
        return res.status(404).json({ message: 'Shop not found for this user' });
      }
  
      const shopName = shop.Shop_name;
      console.log('Shop Name:', shopName);
  
      const userItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'], // Get the item IDs
      });
  
      if (!userItems || userItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this shop' });
      }
  
      const userItemIDs = userItems.map((item) => item.Item_ID);
      console.log('User Item IDs:', userItemIDs);
  
      // Fetch orders that contain the user's items and have a 'pending' status
      const orders = await Orders.findAll({
        where: { status: 'pending' }, // Filter orders by status
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias', // Alias for OrderItems
            where: { item_id: userItemIDs },
            attributes: ['item_id', 'quantity', 'price'],
            include: [
              {
                model: Items,
                as: 'ItemsAlias', // Alias for Items
                attributes: ['item_name', 'Price'], // Include only item name and price
              },
            ],
          },
        ],
        attributes: ['order_id', 'total_price', 'payment_method', 'status', 'created_at'],
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No pending orders found for this user' });
      }
  
      // Respond with the orders, including items
      res.status(200).json({
        message: 'Pending orders fetched successfully',
        orders: orders.map((order) => ({
          order_id: order.order_id,
          total_price: order.total_price,
          payment_method: order.payment_method,
          status: order.status,
          created_at: order.created_at,
          items: order.OrderItemsAlias.map((orderItem) => ({
            item_id: orderItem.item_id,
            quantity: orderItem.quantity,
            price: orderItem.price,
            item_details: {
              name: orderItem.ItemsAlias.item_name,
              price: orderItem.ItemsAlias.Price,
            },
          })),
        })),
      });
    } catch (error) {
      console.error('Error fetching orders for user:', error);
      res.status(500).json({
        message: 'Failed to fetch orders for user',
        error: error.message,
      });
    }
  });
  
  
  
  
  
  


  const updateOrderStatus = catchAsync(async (req, res, next) => {
    const { order_id, status } = req.body;
  
    // Validate input
    if (!order_id || !status || !['completed', 'declined'].includes(status.toLowerCase())) {
      return res.status(400).json({ message: 'Invalid order ID or status provided.' });
    }
  
    try {
      // Step 1: Find the order
      const order = await Orders.findOne({ where: { order_id } });
      if (!order) {
        return res.status(404).json({ message: 'Order not found.' });
      }
  
      // Step 2: Update order status
      order.status = status.toLowerCase() === 'approved' ? 'completed' : 'declined';
      await order.save();
  
      if (status.toLowerCase() === 'approved') {
        // Step 3: Find all OrderItems associated with this order
        const orderItems = await OrderItems.findAll({
          where: { order_id },
          include: [
            {
              model: Items,
              as: 'Item', // Use the correct alias defined in your association
              attributes: ['Item_ID', 'item_name', 'Quantity'],
            },
          ],
        });
  
        if (!orderItems || orderItems.length === 0) {
          return res.status(404).json({ message: 'No items found for this order.' });
        }
  
        // Step 4: Update item quantities
        for (const orderItem of orderItems) {
          const item = orderItem.Item; // Joined item details
  
          if (!item || item.Quantity < orderItem.quantity) {
            return res.status(400).json({
              message: `Insufficient stock for item: ${item.item_name}.`,
            });
          }
  
          // Lower the item's quantity
          item.Quantity -= orderItem.quantity;
          console.log(orderItem.quantity);
          console.log(item.quantity);
          await item.save();
        }
  
        return res.status(200).json({
          message: 'Order approved and item quantities updated successfully.',
        });
      }
  
      // If order is declined, just update status
      return res.status(200).json({
        message: `Order status updated to ${order.status}.`,
      });
    } catch (error) {
      console.error('Error updating order status:', error);
      return res.status(500).json({
        message: 'Failed to update order status.',
        error: error.message,
      });
    }
  });



  const countPendingOrders = catchAsync(async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decoded.id;
  
      const user = await User.findOne({
        where: { id: userID },
        attributes: ['Username'],
      });
  
      if (!user || !user.Username) {
        return res.status(404).json({ message: 'User not found or username is missing' });
      }
  
      const username = user.Username;
  
      const seller = await Sellers.findOne({
        where: { Username: username },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Shop not found for this user' });
      }
  
      const shopName = seller.Shop_name;
  
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'],
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
  
      const Count = await Orders.count({
        where: { status: 'pending' },
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias',
            where: { item_id: sellerItemIDs },
          },
        ],
      });
  
      res.status(200).json({
        message: 'Pending orders count fetched successfully',
        Count,
      });
    } catch (error) {
      console.error('Error counting pending orders:', error);
      res.status(500).json({
        message: 'Failed to count pending orders',
        error: error.message,
      });
    }
  });
  
  



  const countCompletedOrders = catchAsync(async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decoded.id;
  
      const user = await User.findOne({
        where: { id: userID },
        attributes: ['Username'],
      });
  
      if (!user || !user.Username) {
        return res.status(404).json({ message: 'User not found or username is missing' });
      }
  
      const username = user.Username;
  
      const seller = await Sellers.findOne({
        where: { Username: username },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Shop not found for this user' });
      }
  
      const shopName = seller.Shop_name;
  
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'],
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
  
      const Count = await Orders.count({
        where: { status: 'completed' },
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias',
            where: { item_id: sellerItemIDs },
          },
        ],
      });
  
      res.status(200).json({
        message: 'Completed orders count fetched successfully',
        Count,
      });
    } catch (error) {
      console.error('Error counting completed orders:', error);
      res.status(500).json({
        message: 'Failed to count completed orders',
        error: error.message,
      });
    }
  });
  



  const getCompletedOrdersForSeller = catchAsync(async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decoded.id;
  
      const user = await User.findOne({
        where: { id: userID },
        attributes: ['Username'],
      });
  
      if (!user || !user.Username) {
        return res.status(404).json({ message: 'User not found or username is missing' });
      }
  
      const username = user.Username;
  
      const seller = await Sellers.findOne({
        where: { Username: username },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Shop not found for this user' });
      }
  
      const shopName = seller.Shop_name;
  
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'],
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
  
      const orders = await Orders.findAll({
        where: { status: 'completed' },
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias',
            where: { item_id: sellerItemIDs },
            attributes: ['item_id', 'quantity', 'price'],
            include: [
              {
                model: Items,
                as: 'ItemsAlias',
                attributes: ['item_name', 'Shop_name'],
              },
            ],
          },
        ],
        attributes: ['order_id', 'total_price', 'payment_method', 'status', 'created_at'],
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No completed orders found for this seller' });
      }
  
      res.status(200).json({
        message: 'Completed orders fetched successfully',
        orders,
      });
    } catch (error) {
      console.error('Error fetching completed orders for seller:', error);
      res.status(500).json({
        message: 'Failed to fetch completed orders for seller',
        error: error.message,
      });
    }
  });
  
  


  const getRejectedOrdersForSeller = catchAsync(async (req, res, next) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decoded.id;
  
      const user = await User.findOne({
        where: { id: userID },
        attributes: ['Username'],
      });
  
      if (!user || !user.Username) {
        return res.status(404).json({ message: 'User not found or username is missing' });
      }
  
      const username = user.Username;
  
      const seller = await Sellers.findOne({
        where: { Username: username },
        attributes: ['Shop_name'],
      });
  
      if (!seller || !seller.Shop_name) {
        return res.status(404).json({ message: 'Shop not found for this user' });
      }
  
      const shopName = seller.Shop_name;
  
      const sellerItems = await Items.findAll({
        where: { Shop_name: shopName },
        attributes: ['Item_ID'],
      });
  
      if (!sellerItems || sellerItems.length === 0) {
        return res.status(404).json({ message: 'No items found for this seller' });
      }
  
      const sellerItemIDs = sellerItems.map((item) => item.Item_ID);
  
      const orders = await Orders.findAll({
        where: { status: ['rejected'] }, // Fetch both pending and rejected orders
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias',
            where: { item_id: sellerItemIDs },
            attributes: ['item_id', 'quantity', 'price'],
            include: [
              {
                model: Items,
                as: 'ItemsAlias',
                attributes: ['item_name', 'Shop_name'],
              },
            ],
          },
        ],
        attributes: ['order_id', 'total_price', 'payment_method', 'status', 'created_at'],
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No pending or rejected orders found for this seller' });
      }
  
      res.status(200).json({
        message: 'Pending and rejected orders fetched successfully',
        orders,
      });
    } catch (error) {
      console.error('Error fetching pending/rejected orders for seller:', error);
      res.status(500).json({
        message: 'Failed to fetch pending/rejected orders for seller',
        error: error.message,
      });
    }
  });





  const checkoutOrder = catchAsync(async (req, res) => {
    try {
      const token = req.headers.authorization?.split(' ')[1];
      if (!token) {
        return res.status(401).json({ message: 'You are not logged in' });
      }
  
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const userID = decoded.id;
  
      const user = await User.findOne({
        where: { id: userID },
        attributes: ['Username', 'Email'],
      });
  
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      const orders = await Orders.findAll({
        where: { buyer_id: userID },
        include: [
          {
            model: OrderItems,
            as: 'OrderItemsAlias',
            attributes: ['item_id', 'quantity', 'price'],
            include: [
              {
                model: Items,
                as: 'ItemsAlias',
                attributes: ['item_name', 'Price', 'Picture', 'Description'],
              },
            ],
          },
        ],
        attributes: ['order_id', 'total_price', 'payment_method', 'status', 'created_at'],
      });
  
      if (!orders || orders.length === 0) {
        return res.status(404).json({ message: 'No orders found for this user' });
      }
  
      const emailContent = `
        <h2>Order Details</h2>
        ${orders.map((order) => `
          <div style="margin-bottom: 20px;">
            <h3>Order ID: ${order.order_id}</h3>
            <p><strong>Total Price:</strong> NIS${order.total_price}</p>
            <p><strong>Payment Method:</strong> ${order.payment_method}</p>
            <p><strong>Status:</strong> ${order.status}</p>
            <p><strong>Date:</strong> ${new Date(order.created_at).toLocaleString()}</p>
            <table border="1" cellpadding="5" cellspacing="0" style="border-collapse: collapse; width: 100%;">
              <thead>
                <tr>
                  <th>Item Name</th>
                  <th>Quantity</th>
                  <th>Price</th>
                  <th>Description</th>
                  <th>Image</th>
                </tr>
              </thead>
              <tbody>
                ${order.OrderItemsAlias.map((orderItem) => `
                  <tr>
                    <td>${orderItem.ItemsAlias.item_name}</td>
                    <td>${orderItem.quantity}</td>
                    <td>$${orderItem.price}</td>
                    <td>${orderItem.ItemsAlias.Description || 'N/A'}</td>
                    <td>
                      ${orderItem.ItemsAlias.Picture
                        ? `<img src="data:image/png;base64,${orderItem.ItemsAlias.Picture.toString(
                            'base64',
                          )}" alt="Item Image" style="max-width: 100px;"/>`
                        : 'No Image'}
                    </td>
                  </tr>
                `).join('')}
              </tbody>
            </table>
          </div>
        `).join('')}
      `;
  
      // Send the email
      await sendEmail({
        email: user.Email,
        subject: 'Order Confirmation',
        message: 'Order details attached below.',
        html: emailContent,
      });
  
      res.status(200).json({
        message: 'Order details sent to email successfully.',
      });
    } catch (error) {
      console.error('Error sending order details to email:', error);
      res.status(500).json({
        message: 'Failed to send order details to email',
        error: error.message,
      });
    }
  });





const respondToOrder = async (req, res) => {
  const { orderId, response } = req.body; 

  try {
    const order = await Orders.findByPk(orderId);
    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = response === 'accepted' ? 'completed' : 'declined';
    await order.save();

    const user = await User.findByPk(order.buyer_id);
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const subject = response === 'accepted' ? 'Order Approved' : 'Order rejected';
    const message =
      response === 'accepted'
        ? `Your order (ID: ${order.id}) has been approved by the seller.`
        : `Unfortunately, your order (ID: ${order.id}) has been rejected by the seller.`;

    const html =
      response === 'accepted'
        ? `<p>Hello ${user.Username},</p>
           <p>Your order <strong>(ID: ${order.id})</strong> has been approved by the seller.</p>
           <p>Thank you for shopping with us!</p>`
        : `<p>Hello ${user.Username},</p>
           <p>Unfortunately, your order <strong>(ID: ${order.id})</strong> has been declined by the seller.</p>
           <p>We apologize for the inconvenience.</p>`;

    await sendEmail({
      email: user.Email,
      subject,
      message,
      html,
    });

    res.status(200).json({
      message: `Order ${response} successfully, email notification sent.`,
      order,
    });
  } catch (error) {
    console.error('Error in respondToOrder:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
};





const getCompletedOrdersForDelivery = async (req, res, next) => {
  try {
    // Fetch completed orders with delivery method as 'delivery'
    const completedOrders = await Orders.findAll({
      where: { 
        status: 'completed', 
        delivery_method: 'Delivery', // Only orders with delivery method 'delivery'
      },
      include: [
        {
          model: OrderItems,
          as: 'OrderItemsList', // Use the alias defined in associations
          include: [
            {
              model: Items,
              as: 'OrderedItem', // Use the alias defined in associations
              attributes: ['item_name', 'description', 'price', 'Picture', 'Shop_name'],
            },
          ],
        },
      ],
      attributes: [
        'order_id',
        'buyer_id',
        'total_price',
        'payment_method',
        'delivery_method',
        'delivery_location', // Include delivery_location field
        'created_at',
      ],
      order: [['created_at', 'DESC']], // Sort by most recent orders
    });

    if (!completedOrders || completedOrders.length === 0) {
      return res.status(404).json({ message: 'No completed delivery orders found' });
    }

    res.status(200).json({
      message: 'Completed delivery orders retrieved successfully',
      orders: completedOrders,
    });
  } catch (error) {
    console.error('Error fetching completed delivery orders:', error);
    res.status(500).json({
      message: 'Failed to fetch completed delivery orders',
      error: error.message,
    });
  }
};



const calculateProfit = async (orderId) => {
  try {
    // Step 1: Fetch all order items for the given order ID
    const orderItems = await OrderItems.findAll({
      where: { order_id: orderId },
      include: [
        {
          model: Items,
          as: 'Item', // Use the alias defined in your associations
          attributes: ['Shop_name', 'Price'],
        },
      ],
    });

    if (!orderItems || orderItems.length === 0) {
      console.log('No items found for the given order ID.');
      return {
        totalSales: 0,
        platformProfit: 0,
        netEarnings: 0,
      };
    }

    let totalSales = 0; // Total sales for "Students Shop" items
    let platformProfit = 0; // Platform's 5% profit
    let netEarnings = 0; // Seller's remaining earnings after profit deduction

    // Step 2: Iterate through the items and calculate profit and earnings
    for (const orderItem of orderItems) {
      const { Item, quantity, price } = orderItem;

      // Ensure the associated item exists and is from "Students Shop"
      if (Item && Item.Shop_name === 'Students Shop') {
        const itemTotal = price * quantity; // Total price for the item
        const itemProfit = itemTotal * 0.05; // Platform's 5% profit
        const itemEarnings = itemTotal - itemProfit; // Seller's net earnings

        totalSales += itemTotal;
        platformProfit += itemProfit;
        netEarnings += itemEarnings;
      }
    }

    // Return the breakdown
    return {
      totalSales,
      platformProfit,
      netEarnings,
    };
  } catch (error) {
    console.error('Error calculating profit:', error);
    throw error;
  }
};




const getBuyerId = async (req, res) => {
  const { orderId } = req.query; // Retrieve orderId from query parameters

  if (!orderId) {
    return res.status(400).json({ error: 'Order ID is required' });
  }

  try {
    // Fetch the order with the specified orderId
    const order = await Orders.findOne({
      where: { order_id: orderId },
      attributes: ['buyer_id'], // Only fetch the buyer_id field
    });

    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Return the buyer_id
    res.status(200).json({ buyer_id: order.buyer_id });
  } catch (error) {
    console.error('Error fetching buyer ID:', error);
    res.status(500).json({ error: 'An error occurred while fetching the buyer ID' });
  }
};
exports.getBuyerId = getBuyerId;
exports.calculateProfit = calculateProfit;
exports.createOrder = createOrder;
exports.getOrdersForSeller = getOrdersForSeller;
exports.updateOrderStatus = updateOrderStatus;
exports.countPendingOrders = countPendingOrders;
exports.countCompletedOrders = countCompletedOrders;
exports.getCompletedOrdersForSeller = getCompletedOrdersForSeller;
exports.getRejectedOrdersForSeller = getRejectedOrdersForSeller;
exports.checkoutOrder = checkoutOrder;
exports.respondToOrder = respondToOrder;
exports.getCompletedOrdersForDelivery = getCompletedOrdersForDelivery;


  