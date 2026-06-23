const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const catalogPath = process.argv[2]
  ? path.resolve(process.argv[2])
  : path.join(__dirname, '..', 'data', 'catalog.json');

function readCatalog() {
  if (!fs.existsSync(catalogPath)) {
    throw new Error(`Catalog file not found: ${catalogPath}`);
  }

  const raw = fs.readFileSync(catalogPath, 'utf8');
  const catalog = JSON.parse(raw);

  return {
    categories: Array.isArray(catalog.categories) ? catalog.categories : [],
    products: Array.isArray(catalog.products) ? catalog.products : []
  };
}

function requireFields(item, fields, label) {
  const missing = fields.filter((field) => item[field] === undefined || item[field] === null || item[field] === '');
  if (missing.length) {
    throw new Error(`${label} is missing required fields: ${missing.join(', ')}`);
  }
}

async function importCatalog() {
  const catalog = readCatalog();

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${mongoose.connection.host}`);

  let categoriesUpserted = 0;
  let productsUpserted = 0;

  for (const category of catalog.categories) {
    requireFields(category, ['name'], 'Category');

    await Category.updateOne(
      { name: category.name },
      {
        $set: {
          name: category.name,
          description: category.description || '',
          image: category.image || ''
        }
      },
      { upsert: true, runValidators: true }
    );

    categoriesUpserted += 1;
  }

  for (const product of catalog.products) {
    requireFields(product, ['name', 'sku', 'price', 'stock', 'category'], 'Product');

    await Product.updateOne(
      { sku: product.sku },
      {
        $set: {
          name: product.name,
          sku: product.sku,
          price: Number(product.price),
          stock: Number(product.stock),
          category: product.category,
          description: product.description || '',
          image: product.image || '',
          oldPrice: product.oldPrice === undefined || product.oldPrice === '' ? null : Number(product.oldPrice),
          rating: product.rating === undefined || product.rating === '' ? 0 : Number(product.rating),
          reviews: product.reviews === undefined || product.reviews === '' ? 0 : Number(product.reviews),
          badge: product.badge || ''
        }
      },
      { upsert: true, runValidators: true }
    );

    productsUpserted += 1;
  }

  console.log(`Categories imported: ${categoriesUpserted}`);
  console.log(`Products imported: ${productsUpserted}`);
}

importCatalog()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
