global.crypto = require('crypto'); // Thêm dòng này ở dòng 1
const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');
const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@nammongodb:27017/product_db?authSource=admin';

const connectWithRetry = () => {
  if (mongoose.connection.readyState === 1) return;
  console.log('Connecting to MongoDB...');
  mongoose.connect(MONGO_URI)
    .then(() => console.log('>>> MONGODB CONNECTED SUCCESS <<<'))
    .catch(err => console.error('>>> MONGODB CONNECT ERROR:', err.message));
};

connectWithRetry();
setInterval(connectWithRetry, 3000);

app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: isConnected ? 'UP' : 'DEGRADED',
    database: isConnected ? 'CONNECTED' : 'DISCONNECTED'
  });
});

// Các tuyến API CRUD giữ nguyên...
app.post('/api/products', async (req, res) => {
  try {
    const product = new Product(req.body);
    await product.save();
    res.status(201).json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.get('/api/products', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.get('/api/products/:pid', async (req, res) => {
  try {
    const product = await Product.findOne({ pid: req.params.pid });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

app.put('/api/products/:pid', async (req, res) => {
  try {
    const product = await Product.findOneAndUpdate({ pid: req.params.pid }, req.body, { new: true });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

app.delete('/api/products/:pid', async (req, res) => {
  try {
    const product = await Product.findOneAndDelete({ pid: req.params.pid });
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;