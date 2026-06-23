const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const shirts = [
  {
    name: 'Real Madrid Home Jersey',
    sku: 'TS-REAL-OFFICIAL',
    price: 120,
    stock: 20,
    image: 'https://www.svpsports.ca/cdn/shop/files/adidas---Men_s-Real-Madrid-Home-Jersey-_JJ1931_1.jpg?v=1749214591&width=800',
    description: 'Real Madrid home football jersey with official product photography.'
  },
  {
    name: 'FC Barcelona Home Jersey',
    sku: 'TS-BARCA-OFFICIAL',
    price: 150,
    stock: 18,
    image: 'https://www.futbolemotion.com/imagesarticulos/269522/60/camiseta-nike-fc-barcelona-primera-equipacion-authentic-2025-2026-deep-royal-blue-deep-royal-blue-noble-red-mid-0.jpg',
    description: 'FC Barcelona home football jersey with real product photography.'
  },
  {
    name: 'Manchester United Home Shirt',
    sku: 'TS-MUN-OFFICIAL',
    price: 88,
    stock: 18,
    image: 'https://www.sportsdirect.com/images/products/37782203_l.jpg',
    description: 'Manchester United home football shirt with real product photography.'
  },
  {
    name: 'Liverpool Home Jersey',
    sku: 'TS-LIV-OFFICIAL',
    price: 125,
    stock: 18,
    image: 'https://assets.adidas.com/images/w_383%2Ch_383%2Cf_auto%2Cq_auto%2Cfl_lossy%2Cc_fill%2Cg_auto/8a398784a17842538acfc4045f73344d_9366/FC_26-27_Burgundy_KA6851_HM1.jpg',
    description: 'Liverpool home football jersey with official Adidas product photography.'
  },
  {
    name: 'Bayern Munich Home Jersey',
    sku: 'TS-BAYERN-OFFICIAL',
    price: 100,
    stock: 16,
    image: 'https://assets.adidas.com/images/w_383%2Ch_383%2Cf_auto%2Cq_auto%2Cfl_lossy%2Cc_fill%2Cg_auto/9ed01db78013461c8fe9c18647c23c6f_9366/FC_26-27_Red_KQ6513_000_plp_model.jpg',
    description: 'Bayern Munich home football jersey with official Adidas product photography.'
  },
  {
    name: 'Juventus Home Jersey',
    sku: 'TS-JUVENTUS-OFFICIAL',
    price: 100,
    stock: 15,
    image: 'https://assets.adidas.com/images/w_383%2Ch_383%2Cf_auto%2Cq_auto%2Cfl_lossy%2Cc_fill%2Cg_auto/0e98ff43cde34483b04e452c643166f9_9366/26-27_White_KC1316_000_plp_model.jpg',
    description: 'Juventus home football jersey with official Adidas product photography.'
  },
  {
    name: 'Paris Saint-Germain Home Jersey',
    sku: 'TS-PSG-OFFICIAL',
    price: 115,
    stock: 15,
    image: 'https://www.sskamo.co.jp/img/goods/C/HJ4593-411.JPG',
    description: 'Paris Saint-Germain home football jersey with real product photography.'
  },
  {
    name: 'Chelsea Home Jersey',
    sku: 'TS-CHELSEA-OFFICIAL',
    price: 120,
    stock: 15,
    image: 'https://www.weston.com.sg/cdn/shop/files/dds_b226f050-9a4e-41f9-834d-ad1f9cfc39ca_1024x1024.jpg?v=1748922307',
    description: 'Chelsea home football jersey with real product photography.'
  }
];

async function importOfficialClubShirts() {
  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${mongoose.connection.host}`);

  await Category.updateOne(
    { name: 't-shirt' },
    {
      $set: {
        name: 't-shirt',
        description: 'Official football club shirts and real product photos.',
        image: shirts[0].image
      }
    },
    { upsert: true, runValidators: true }
  );

  for (const shirt of shirts) {
    await Product.updateOne(
      { sku: shirt.sku },
      {
        $set: {
          ...shirt,
          category: 't-shirt',
          oldPrice: null,
          rating: 4.8,
          reviews: 0,
          badge: 'new'
        }
      },
      { upsert: true, runValidators: true }
    );
  }

  console.log(`Official club shirts imported: ${shirts.length}`);
}

importOfficialClubShirts()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
