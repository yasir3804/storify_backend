const Customer = require("../models/customerModel");
const Product = require("../models/productModel"); // Assuming Product model exists
const mongoose = require("mongoose");
const moment = require("moment");

const createCustomerOrder = async (req, res) => {
  try {
    const {
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_products, // Array containing { product_id, quantity, price }
    } = req.body;

    // Check if the customer already exists by email or phone
    let existingCustomer = await Customer.findOne({
      $or: [{ customer_email }, { customer_phone }],
      user_id,
    });

    if (existingCustomer) {
      return res.status(400).json({
        error: "Customer already exists with this email or phone number.",
      });
    }

    let totalOrderPrice = 0; // Initialize total order price

    // Iterate over the customer_products to calculate the total order price and update the product quantities
    for (let product of customer_products) {
      const { product_id, quantity, price } = product;

      // Fetch the product from the database
      const productInStock = await Product.findById(product_id);

      if (!productInStock) {
        return res.status(404).json({
          error: `Product with ID ${product_id} not found.`,
        });
      }

      // Check if there is enough quantity available in stock
      if (productInStock.quantity < quantity) {
        return res.status(400).json({
          error: `Not enough stock for product: ${productInStock.name}. Only ${productInStock.quantity} available.`,
        });
      }

      // Deduct the quantity from the product's stock
      productInStock.quantity -= quantity;
      await productInStock.save(); // Save the updated product

      // Calculate the total price for this product in the order
      totalOrderPrice += price * quantity;
    }

    // Create a new customer order
    const newCustomerOrder = new Customer({
      user_id,
      customer_name,
      customer_email,
      customer_phone,
      customer_address,
      customer_products,
      customer_order_total: totalOrderPrice, // Set the total price dynamically
    });

    // Save the new customer to the database
    await newCustomerOrder.save();

    res.status(201).json({
      success: true,
      message: "Customer order created successfully.",
      data: newCustomerOrder,
    });
  } catch (error) {
    console.error("Error creating customer order:", error);
    res.status(500).json({
      error: "An error occurred while creating the customer order.",
    });
  }
};

//Invoice api

const generateInvoice = async (req, res) => {
  try {
    const { customer_id } = req.params; // Customer ID from URL parameters
    const { date } = req.query; // Date from query parameters (optional)

    // Build the match condition dynamically
    const matchCondition = { _id: new mongoose.Types.ObjectId(customer_id) };

    // If a date is provided, add the date range filter
    if (date) {
      const startOfDay = moment(date, "YYYY-MM-DD").startOf("day").toDate();
      const endOfDay = moment(date, "YYYY-MM-DD").endOf("day").toDate();
      matchCondition.customer_order_date = { $gte: startOfDay, $lte: endOfDay };
    }

    // Aggregate to get the customer order with product details
    const invoiceData = await Customer.aggregate([
      { $match: matchCondition }, // Match the customer and optionally filter by date
      { $unwind: "$customer_products" }, // Deconstruct the customer_products array
      {
        $lookup: {
          from: "products", // Join with the 'products' collection
          localField: "customer_products.product_id", // Match customer_products.product_id with the product _id
          foreignField: "_id", // Match it to the _id of the product
          as: "product_details", // Output the matched products in a new field "product_details"
        },
      },
      { $unwind: "$product_details" }, // Unwind the product details (flatten the result)
      {
        $project: {
          customer_name: 1,
          customer_email: 1,
          customer_phone: 1,
          customer_address: 1,
          "product_details.name": 1, // Include product name
          "product_details.price": 1, // Include product price
          "customer_products.quantity": 1, // Include product quantity
          customer_order_total: 1, // Include the total order amount
          customer_order_date: 1, // Include the order date
        },
      },
    ]);

    if (!invoiceData.length) {
      return res.status(404).json({
        error: "Customer order not found.",
      });
    }

    // Generate the invoice details
    const invoice = {
      customer_name: invoiceData[0].customer_name,
      customer_email: invoiceData[0].customer_email,
      customer_phone: invoiceData[0].customer_phone,
      customer_address: invoiceData[0].customer_address,
      products: invoiceData.map((item) => ({
        product_name: item.product_details.name,
        quantity: item.customer_products.quantity,
        price: item.product_details.price,
        total: item.customer_products.quantity * item.product_details.price,
      })),
      order_total: invoiceData[0].customer_order_total,
      order_date: invoiceData[0].customer_order_date,
    };

    // Send the invoice as a response
    res.status(200).json({
      success: true,
      message: "Invoice generated successfully.",
      invoice,
    });
  } catch (error) {
    console.error("Error generating invoice:", error);
    res.status(500).json({
      error: "An error occurred while generating the invoice.",
    });
  }
};

const getCustomersByUserId = async (req, res) => {
  try {
    const { id } = req.params; // Assuming the user_id is passed as a URL parameter

    // Find customers associated with the provided user_id
    const customers = await Customer.find({ user_id: id });

    // Return the customers
    res.status(200).json({
      success: true,
      message: "Customers retrieved successfully.",
      data: customers,
    });
  } catch (error) {
    console.error("Error fetching customers:", error);
    res.status(500).json({
      error: "An error occurred while fetching customers.",
    });
  }
};

module.exports = { createCustomerOrder, getCustomersByUserId, generateInvoice };
