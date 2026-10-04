const express = require('express');
const mongoose = require('mongoose');
require('dotenv').config();

const Product = require('./models/Product');

const app = express();
app.use(express.json());

const MONGO_URI = process.env.MONGO_URI || 'mongodb://root:example@nammongodb:27017/product_db?authSource=admin';

// Log rõ ràng trạng thái kết nối
mongoose.connect(MONGO_URI)
  .then(() => console.log('>>> MONGODB CONNECTED SUCCESS <<<'))
  .catch(err => console.error('>>> MONGODB CONNECT ERROR:', err.message));

// Healthcheck route: Trả về status 200 kèm trạng thái DB
app.get('/health', (req, res) => {
  const isConnected = mongoose.connection.readyState === 1;
  res.status(200).json({
    status: isConnected ? 'UP' : 'DEGRADED',
    database: isConnected ? 'CONNECTED' : 'DISCONNECTED'
  });
});

// Các CRUD Routes giữ nguyên...
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

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));

module.exports = app;