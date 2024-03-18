const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');

const app = express();
app.use(bodyParser.json());

// Connect to MongoDB
mongoose.connect('mongodb://localhost:27017/restaurant_db', { useNewUrlParser: true, useUnifiedTopology: true });
const db = mongoose.connection;
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

//Product Schema
const productSchema = new mongoose.Schema({
    name: String,
    price: Number,
    description: String
});
const Product = mongoose.model('Product', productSchema);

//Order Schema
const orderSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product'
    },
    quantity: Number,
    totalPrice: Number,
    status: {
        type: String,
        enum: ['pending', 'completed'],
        default: 'pending'
    }
});
const Order = mongoose.model('Order', orderSchema);

// CRUD operations for Products
// Create a product
app.post('/products', async (req, res) => {
    try {
        const product = await Product.create(req.body);
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Read all products
app.get('/products', async (req, res) => {
    try {
        const products = await Product.find();
        res.json(products);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Update a product
app.put('/products/:id', async (req, res) => {
    try {
        const product = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
        res.json(product);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Delete a product
app.delete('/products/:id', async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ message: 'Product deleted successfully' });
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Place an order
app.post('/orders', async (req, res) => {
    try {
        const { product, quantity } = req.body;
        const selectedProduct = await Product.findById(product);
        if (!selectedProduct) {
            return res.status(404).json({ error: 'Product not found' });
        }
        const totalPrice = selectedProduct.price * quantity;
        const order = await Order.create({ product, quantity, totalPrice });
        res.json(order);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// List all orders
app.get('/orders', async (req, res) => {
    try {
        const orders = await Order.find();
        res.json(orders);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

// Start the server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
