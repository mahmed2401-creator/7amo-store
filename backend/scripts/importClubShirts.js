const fs = require('fs');
const path = require('path');
const dotenv = require('dotenv');
const mongoose = require('mongoose');
const Category = require('../models/Category');
const Product = require('../models/Product');

dotenv.config({ path: path.join(__dirname, '..', '.env') });

const PORT = process.env.PORT || 5000;
const baseUrl = `http://localhost:${PORT}`;
const uploadDir = path.join(__dirname, '..', 'uploads', 'club-shirts');

const clubShirts = [
  { club: 'Real Madrid', sku: 'TS-REAL-001', price: 95, stock: 25, primary: '#ffffff', secondary: '#facc15', text: '#111827', badge: 'new' },
  { club: 'FC Barcelona', sku: 'TS-BARCA-001', price: 92, stock: 24, primary: '#a50044', secondary: '#004d98', text: '#ffffff', badge: 'new' },
  { club: 'Manchester United', sku: 'TS-MUN-001', price: 88, stock: 22, primary: '#da291c', secondary: '#111827', text: '#ffffff', badge: '' },
  { club: 'Manchester City', sku: 'TS-MCI-001', price: 90, stock: 20, primary: '#6cabdd', secondary: '#ffffff', text: '#0f172a', badge: '' },
  { club: 'Liverpool', sku: 'TS-LIV-001', price: 89, stock: 21, primary: '#c8102e', secondary: '#00b2a9', text: '#ffffff', badge: '' },
  { club: 'Arsenal', sku: 'TS-ARS-001', price: 87, stock: 18, primary: '#ef0107', secondary: '#ffffff', text: '#ffffff', badge: 'low' },
  { club: 'Chelsea', sku: 'TS-CHE-001', price: 86, stock: 19, primary: '#034694', secondary: '#ffffff', text: '#ffffff', badge: '' },
  { club: 'Tottenham Hotspur', sku: 'TS-TOT-001', price: 84, stock: 16, primary: '#ffffff', secondary: '#132257', text: '#111827', badge: '' },
  { club: 'Bayern Munich', sku: 'TS-BAY-001', price: 91, stock: 20, primary: '#dc052d', secondary: '#0066b2', text: '#ffffff', badge: '' },
  { club: 'Borussia Dortmund', sku: 'TS-BVB-001', price: 82, stock: 17, primary: '#fde100', secondary: '#000000', text: '#111827', badge: '' },
  { club: 'Paris Saint-Germain', sku: 'TS-PSG-001', price: 94, stock: 18, primary: '#004170', secondary: '#da291c', text: '#ffffff', badge: 'new' },
  { club: 'Juventus', sku: 'TS-JUV-001', price: 86, stock: 16, primary: '#ffffff', secondary: '#000000', text: '#111827', badge: '' },
  { club: 'AC Milan', sku: 'TS-ACM-001', price: 85, stock: 15, primary: '#fb090b', secondary: '#000000', text: '#ffffff', badge: '' },
  { club: 'Inter Milan', sku: 'TS-INT-001', price: 85, stock: 15, primary: '#0068a8', secondary: '#000000', text: '#ffffff', badge: '' },
  { club: 'Atletico Madrid', sku: 'TS-ATM-001', price: 83, stock: 14, primary: '#cb3524', secondary: '#ffffff', text: '#ffffff', badge: '' },
  { club: 'Ajax', sku: 'TS-AJX-001', price: 78, stock: 13, primary: '#ffffff', secondary: '#d2122e', text: '#111827', badge: '' },
  { club: 'Benfica', sku: 'TS-BEN-001', price: 76, stock: 13, primary: '#e83030', secondary: '#ffffff', text: '#ffffff', badge: '' },
  { club: 'Al Ahly', sku: 'TS-AHL-001', price: 68, stock: 30, primary: '#d71920', secondary: '#ffffff', text: '#ffffff', badge: 'new' },
  { club: 'Zamalek', sku: 'TS-ZAM-001', price: 66, stock: 28, primary: '#ffffff', secondary: '#d71920', text: '#111827', badge: 'new' }
];

function slugify(value) {
  return value.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
}

function shirtSvg({ club, primary, secondary, text }) {
  const escapedClub = club.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

  return `<svg xmlns="http://www.w3.org/2000/svg" width="900" height="900" viewBox="0 0 900 900">
  <rect width="900" height="900" fill="#0f172a"/>
  <rect x="74" y="74" width="752" height="752" rx="42" fill="#111827" stroke="#1f2937" stroke-width="4"/>
  <path d="M326 145h248l82 66 114 42-56 156-92-32v326c0 29-24 53-53 53H331c-29 0-53-24-53-53V377l-92 32-56-156 114-42 82-66z" fill="${primary}" stroke="#e5e7eb" stroke-opacity=".35" stroke-width="6"/>
  <path d="M326 145c22 62 72 96 124 96s102-34 124-96" fill="none" stroke="${secondary}" stroke-width="24" stroke-linecap="round"/>
  <path d="M450 257v486" stroke="${secondary}" stroke-width="52" stroke-opacity=".9"/>
  <path d="M278 377l-92 32-56-156 114-42 34 74v92z" fill="${secondary}" fill-opacity=".9"/>
  <path d="M622 377l92 32 56-156-114-42-34 74v92z" fill="${secondary}" fill-opacity=".9"/>
  <circle cx="450" cy="420" r="72" fill="#ffffff" fill-opacity=".14" stroke="${secondary}" stroke-width="8"/>
  <text x="450" y="432" font-family="Arial, Helvetica, sans-serif" font-size="58" font-weight="800" text-anchor="middle" fill="${text}">7</text>
  <text x="450" y="662" font-family="Arial, Helvetica, sans-serif" font-size="42" font-weight="800" text-anchor="middle" fill="${text}">${escapedClub}</text>
  <text x="450" y="714" font-family="Arial, Helvetica, sans-serif" font-size="24" font-weight="700" text-anchor="middle" fill="${text}" opacity=".72">Fan T-Shirt</text>
</svg>`;
}

async function importClubShirts() {
  fs.mkdirSync(uploadDir, { recursive: true });

  await mongoose.connect(process.env.MONGO_URI);
  console.log(`MongoDB Connected: ${mongoose.connection.host}`);

  await Category.updateOne(
    { name: 't-shirt' },
    {
      $set: {
        name: 't-shirt',
        description: 'Football club fan t-shirts inspired by major teams.',
        image: `${baseUrl}/uploads/club-shirts/real-madrid.svg`
      }
    },
    { upsert: true, runValidators: true }
  );

  for (const shirt of clubShirts) {
    const fileName = `${slugify(shirt.club)}.svg`;
    const filePath = path.join(uploadDir, fileName);
    fs.writeFileSync(filePath, shirtSvg(shirt), 'utf8');

    await Product.updateOne(
      { sku: shirt.sku },
      {
        $set: {
          name: `${shirt.club} Fan T-Shirt`,
          sku: shirt.sku,
          price: shirt.price,
          stock: shirt.stock,
          category: 't-shirt',
          description: `Premium fan-style t-shirt inspired by ${shirt.club} colors. Clean sports fit for casual wear and match days.`,
          image: `${baseUrl}/uploads/club-shirts/${fileName}`,
          oldPrice: null,
          rating: 4.8,
          reviews: 0,
          badge: shirt.badge
        }
      },
      { upsert: true, runValidators: true }
    );
  }

  console.log('Category imported: t-shirt');
  console.log(`Club t-shirts imported: ${clubShirts.length}`);
}

importClubShirts()
  .catch((error) => {
    console.error(error.message);
    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
