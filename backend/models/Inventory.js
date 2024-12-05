const mongoose = require('mongoose');

const inventorySchema = new mongoose.Schema({
  item: { type: String, required: true },
  quantity: { type: Number, required: true },
  unit: { type: String, required: true },
  lowStockThreshold: { type: Number, required: true },
  lastRestocked: { type: Date, default: Date.now },
  supplier: { type: String }
});

module.exports = mongoose.model('Inventory', inventorySchema);
