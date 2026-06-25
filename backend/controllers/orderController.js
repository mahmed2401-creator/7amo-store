const Order = require('../models/Order');
const Product = require('../models/Product');
const sendTelegramOrder = require('../utils/sendTelegramOrder');

function withTimeout(promise, timeoutMs, message) {
  return Promise.race([
    promise,
    new Promise((_, reject) => {
      setTimeout(() => reject(new Error(message)), timeoutMs);
    }),
  ]);
}

const addOrderItems = async (req, res) => {
  const { orderItems, shippingAddress, paymentMethod } = req.body;

  if (orderItems && orderItems.length === 0) {
    return res.status(400).json({ message: 'No order items' });
  } else if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.address || !shippingAddress.city) {
    return res.status(400).json({ message: 'Complete shipping information is required' });
  } else {
    try {
      const normalizedItems = await Promise.all(orderItems.map(async (item) => {
        const product = await Product.findById(item.product);
        const price = product ? Number(product.price || 0) : Number(item.price || 0);
        const qty = Number(item.qty || item.quantity || 0);

        return {
          name: product ? product.name : item.name,
          qty,
          image: product ? product.image : item.image,
          price,
          product: item.product,
        };
      }));

      const calculatedItemsPrice = normalizedItems.reduce((sum, item) => sum + (item.price * item.qty), 0);
      const calculatedShippingPrice = Number(req.body.shippingPrice ?? 10);
      const calculatedTotalPrice = calculatedItemsPrice + calculatedShippingPrice;

      const order = new Order({
        user: req.user ? req.user._id : undefined, // Attach user if logged in
        orderItems: normalizedItems,
        shippingAddress,
        paymentMethod: paymentMethod || 'Cash on Delivery',
        paymentStatus: 'pending',
        isPaid: false,
        itemsPrice: calculatedItemsPrice,
        shippingPrice: calculatedShippingPrice,
        totalPrice: calculatedTotalPrice,
      });

      const createdOrder = await order.save();
      const populatedOrder = await Order.findById(createdOrder._id).populate('user', 'firstName lastName email');

      try {
        await withTimeout(
          sendTelegramOrder(populatedOrder),
          5000,
          'Telegram notification timed out after 5 seconds'
        );
      } catch (telegramError) {
        console.error(telegramError.message);
      }

      res.status(201).json(createdOrder);
    } catch (error) {
      res.status(500).json({ message: 'Server Error', error: error.message });
    }
  }
};


const getOrderById = async (req, res) => {
  try {
    const order = await Order.findById(req.params.id).populate('user', 'firstName lastName email');

    if (order) {
      res.json(order);
    } else {
      res.status(404).json({ message: 'Order not found' });
    }
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get logged in user orders
// @route   GET /api/orders/myorders
// @access  Private
const getMyOrders = async (req, res) => {
  try {
    const orders = await Order.find({ user: req.user._id });
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Get all orders
// @route   GET /api/orders
// @access  Private/Admin
const getOrders = async (req, res) => {
  try {
    const orders = await Order.find({}).populate('user', 'id firstName lastName email');
    res.json(orders);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private/Admin
const updateOrderStatus = async (req, res) => {
  const allowedStatuses = ['pending', 'processing', 'shipped', 'delivered', 'cancelled'];
  const { status } = req.body;

  if (!allowedStatuses.includes(status)) {
    return res.status(400).json({ message: 'Invalid order status' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.status = status;
    order.isDelivered = status === 'delivered';
    order.deliveredAt = status === 'delivered' ? order.deliveredAt || Date.now() : undefined;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

// @desc    Update order payment status
// @route   PUT /api/orders/:id/payment-status
// @access  Private/Admin
const updateOrderPaymentStatus = async (req, res) => {
  const allowedStatuses = ['pending', 'paid'];
  const { paymentStatus } = req.body;

  if (!allowedStatuses.includes(paymentStatus)) {
    return res.status(400).json({ message: 'Invalid payment status' });
  }

  try {
    const order = await Order.findById(req.params.id);

    if (!order) {
      return res.status(404).json({ message: 'Order not found' });
    }

    order.paymentStatus = paymentStatus;
    order.isPaid = paymentStatus === 'paid';
    order.paidAt = paymentStatus === 'paid' ? order.paidAt || Date.now() : undefined;

    const updatedOrder = await order.save();
    res.json(updatedOrder);
  } catch (error) {
    res.status(500).json({ message: 'Server Error', error: error.message });
  }
};

module.exports = {
  addOrderItems,
  getOrderById,
  getMyOrders,
  getOrders,
  updateOrderStatus,
  updateOrderPaymentStatus,
};
