/**
 * UWANI Ceylon Organics & Lifestyle
 * Robust Database Seeder (Promise-based)
 */

const fs = require('fs');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

const DB_PATH = path.join(__dirname, 'uwani.db');
const SCHEMA_PATH = path.join(__dirname, 'schema.sql');

function openDatabase() {
    return new Promise((resolve, reject) => {
        // If file exists, we can remove it or reuse
        if (fs.existsSync(DB_PATH)) {
            try { fs.unlinkSync(DB_PATH); } catch (e) { /* ignore */ }
        }
        const db = new sqlite3.Database(DB_PATH, (err) => {
            if (err) return reject(err);
            resolve(db);
        });
    });
}

function runAsync(db, sql, params = []) {
    return new Promise((resolve, reject) => {
        db.run(sql, params, function(err) {
            if (err) return reject(err);
            resolve(this);
        });
    });
}

function execAsync(db, sql) {
    return new Promise((resolve, reject) => {
        db.exec(sql, (err) => {
            if (err) return reject(err);
            resolve();
        });
    });
}

async function initAndSeed(callback) {
    let db;
    try {
        db = await openDatabase();
        console.log('[Seed] Database connected.');

        // Turn foreign keys off temporarily during initial schema recreation
        await runAsync(db, 'PRAGMA foreign_keys = OFF;');

        const schemaSql = fs.readFileSync(SCHEMA_PATH, 'utf8');
        await execAsync(db, schemaSql);
        console.log('[Seed] Schema applied.');

        await runAsync(db, 'PRAGMA foreign_keys = ON;');

        // Categories
        const categories = [
            { id: 1, name: 'Ceylon Herbal Teas', slug: 'ceylon-herbal-teas', description: 'Single-origin, hand-plucked loose leaf teas and organic herbal wellness infusions.', icon: 'ri-cup-line' },
            { id: 2, name: 'Pure Ceylon Spices', slug: 'pure-ceylon-spices', description: 'Direct-trade sun-dried spices harvested from organic home gardens in Matale & Kandy.', icon: 'ri-plant-line' },
            { id: 3, name: 'Handcrafted Homeware', slug: 'handcrafted-homeware', description: 'Ethically crafted clay pottery, palm weave dining ware, and sustainable living accents.', icon: 'ri-home-heart-line' },
            { id: 4, name: 'Organic Coconut Wellness', slug: 'organic-coconut-wellness', description: 'Pure cold-pressed virgin coconut oil, body balms, and natural lifestyle nourishment.', icon: 'ri-heart-pulse-line' }
        ];

        for (const cat of categories) {
            await runAsync(db, 
                'INSERT INTO categories (id, name, slug, description, icon) VALUES (?, ?, ?, ?, ?)',
                [cat.id, cat.name, cat.slug, cat.description, cat.icon]
            );
        }
        console.log('[Seed] Inserted 4 categories.');

        // Products
        const products = [
            {
                id: 1,
                category_id: 1,
                sku: 'UWN-TEA-001',
                name: 'Royal Nuwara Eliya Pekoe Tea',
                slug: 'royal-nuwara-eliya-pekoe-tea',
                short_desc: 'High-elevation Ceylon black tea with delicate floral notes and golden liquor.',
                description: 'Sourced from misty single-estate hillsides situated 6,200 feet above sea level in Nuwara Eliya. Hand-plucked tender bud and top two leaves, orthodox rolled and gently fermented to preserve bright amber clarity and natural Muscatel undertones. 100g loose leaf canister.',
                price: 14.50,
                stock_quantity: 48,
                rating: 4.9,
                review_count: 38,
                image_url: 'images/products/tea-pekoe.svg',
                badge: 'Best Seller',
                is_featured: 1,
                origin: 'Pedro Estate, Nuwara Eliya'
            },
            {
                id: 2,
                category_id: 2,
                sku: 'UWN-SPC-001',
                name: 'Alba Grade True Ceylon Cinnamon',
                slug: 'alba-grade-true-ceylon-cinnamon',
                short_desc: 'Pencil-thin Cinnamomum verum quills with sweet woody fragrance and low coumarin.',
                description: 'The highest global grade of true Ceylon cinnamon hand-peeled by master peelers in southern Sri Lanka. Ultra-thin concentric parchment layers with a soft, warm, subtle sweetness and delicate citrus aroma. Certified organic and non-irradiated. 100g glass jar.',
                price: 18.00,
                stock_quantity: 32,
                rating: 5.0,
                review_count: 54,
                image_url: 'images/products/cinnamon-alba.svg',
                badge: 'Rare Harvest',
                is_featured: 1,
                origin: 'Mirissa Coastal Forest, Southern Province'
            },
            {
                id: 3,
                category_id: 1,
                sku: 'UWN-TEA-002',
                name: 'Organic Moringa & Lemongrass Infusion',
                slug: 'organic-moringa-lemongrass-infusion',
                short_desc: 'Caffeine-free revitalizing tisane rich in antioxidants and crisp citrus vitality.',
                description: 'A soothing caffeine-free botanical blend combining nutrient-dense drumstick leaves (Moringa oleifera) and wild harvested lemongrass. Dried under low-temperature solar dehydrators to preserve vital vitamins, bioflavonoids, and crisp herbal fragrance. 80g tin.',
                price: 12.00,
                stock_quantity: 60,
                rating: 4.8,
                review_count: 29,
                image_url: 'images/products/tea-moringa.svg',
                badge: 'Organic',
                is_featured: 1,
                origin: 'Kurunegala Organic Agroforestry'
            },
            {
                id: 4,
                category_id: 4,
                sku: 'UWN-WEL-001',
                name: 'Virgin Cold-Pressed Coconut Oil 500ml',
                slug: 'virgin-cold-pressed-coconut-oil-500ml',
                short_desc: 'Centrifuged raw extra virgin oil with silky texture and gentle coconut aroma.',
                description: 'Extracted within 48 hours of hand-harvesting fresh mature coconuts from certified regenerative coastal groves. Cold-pressed without heat or chemical processing, preserving raw lauric acid, natural vitamin E, and velvety smoothness. Ideal for culinary and wellness rituals.',
                price: 16.50,
                stock_quantity: 25,
                rating: 4.9,
                review_count: 43,
                image_url: 'images/products/coconut-oil.svg',
                badge: '100% Pure',
                is_featured: 1,
                origin: 'Chilaw Coconut Triangle'
            },
            {
                id: 5,
                category_id: 3,
                sku: 'UWN-HOM-001',
                name: 'Artisan Terracotta Tea Mug & Saucer',
                slug: 'artisan-terracotta-tea-mug-saucer',
                short_desc: 'Hand-thrown unglazed terracotta clay cup enhancing natural earth notes in tea.',
                description: 'Each piece is individually wheel-thrown and wood-fired by traditional village potters in Molagoda. The natural micro-porous terracotta breathes subtly, cooling hot infusions gently while adding an authentic tactile connection to your daily tea ceremony. 320ml capacity.',
                price: 22.00,
                stock_quantity: 18,
                rating: 4.7,
                review_count: 19,
                image_url: 'images/products/terracotta-mug.svg',
                badge: 'Handcrafted',
                is_featured: 1,
                origin: 'Molagoda Artisan Village, Kegalle'
            },
            {
                id: 6,
                category_id: 2,
                sku: 'UWN-SPC-002',
                name: 'Whole Sun-Dried Matale Black Peppercorns',
                slug: 'whole-sundried-matale-black-peppercorns',
                short_desc: 'High-piperine pungent black peppercorns from shaded tropical spice groves.',
                description: 'Cultivated on forest-grown vines in the central highlands of Matale. Hand-harvested at peak maturity, boiled briefly and naturally sun-cured over three days on woven coir mats. Distinctive high-piperine heat, bold woody aroma, and deep obsidian finish. 150g pouch.',
                price: 9.50,
                stock_quantity: 50,
                rating: 4.8,
                review_count: 22,
                image_url: 'images/products/black-pepper.svg',
                badge: 'Direct Trade',
                is_featured: 0,
                origin: 'Matale Spice Valley'
            },
            {
                id: 7,
                category_id: 3,
                sku: 'UWN-HOM-002',
                name: 'Hand-Woven Palmyrah Table Runner',
                slug: 'hand-woven-palmyrah-dining-table-runner',
                short_desc: 'Eco-conscious table runner hand-plaited using sustainable wild palmyrah leaves.',
                description: 'Woven by women artisanal cooperatives in Jaffna. Using sun-bleached natural palm fronds and eco-friendly vegetable dyes, this durable textured runner brings organic tropical elegance to contemporary dining spaces. Dimensions: 180cm x 35cm.',
                price: 28.00,
                stock_quantity: 14,
                rating: 5.0,
                review_count: 16,
                image_url: 'images/products/palmyrah-runner.svg',
                badge: 'Fair Trade',
                is_featured: 0,
                origin: 'Point Pedro Artisan Collective'
            },
            {
                id: 8,
                category_id: 2,
                sku: 'UWN-SPC-003',
                name: 'Jumbo Green Ceylon Cardamom Pods',
                slug: 'jumbo-green-ceylon-cardamom-pods',
                short_desc: 'Intensely fragrant forest cardamom with whole aromatic seeds intact.',
                description: 'Known historically as the Queen of Spices, our premium grade cardamom is grown in the shaded forest understoreys of Knuckles Range. Carefully hand-picked and cured in dark chambers to retain vivid olive-green color and intense camphor-sweet essential oils. 60g jar.',
                price: 24.00,
                stock_quantity: 20,
                rating: 4.9,
                review_count: 31,
                image_url: 'images/products/cardamom-pods.svg',
                badge: 'Rare Harvest',
                is_featured: 1,
                origin: 'Knuckles Mountain Range, Kandy'
            }
        ];

        for (const p of products) {
            await runAsync(db, `
                INSERT INTO products 
                (id, category_id, sku, name, slug, short_desc, description, price, stock_quantity, rating, review_count, image_url, badge, is_featured, origin)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            `, [
                p.id, p.category_id, p.sku, p.name, p.slug, p.short_desc, p.description,
                p.price, p.stock_quantity, p.rating, p.review_count, p.image_url,
                p.badge, p.is_featured, p.origin
            ]);
        }
        console.log('[Seed] Inserted 8 products.');

        // Orders & Order Items
        await runAsync(db, `
            INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, city, postal_code, payment_method, subtotal, shipping_fee, discount, total_amount, status, notes)
            VALUES (1, 'UWN-2026-1001', 'Dinuka Perera', 'dinuka.p@example.lk', '+94 77 123 4567', '42/3 Horton Place, Cinnamon Gardens', 'Colombo 07', '00700', 'Credit Card (Online)', 32.50, 3.50, 3.25, 32.75, 'Delivered', 'Leave package with security gate if unavailable.')
        `);
        await runAsync(db, `
            INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, total_price)
            VALUES (1, 1, 'Royal Nuwara Eliya Pekoe Tea', 14.50, 1, 14.50),
                   (1, 2, 'Alba Grade True Ceylon Cinnamon', 18.00, 1, 18.00)
        `);

        await runAsync(db, `
            INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, city, postal_code, payment_method, subtotal, shipping_fee, discount, total_amount, status, notes)
            VALUES (2, 'UWN-2026-1002', 'Ayesha Fernando', 'ayesha.f@example.lk', '+94 71 889 9001', '15 Rajapihilla Mawatha', 'Kandy', '20000', 'Cash on Delivery', 38.50, 3.50, 0.00, 42.00, 'Processing', 'Please call before delivery dispatch.')
        `);
        await runAsync(db, `
            INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, total_price)
            VALUES (2, 4, 'Virgin Cold-Pressed Coconut Oil 500ml', 16.50, 1, 16.50),
                   (2, 5, 'Artisan Terracotta Tea Mug & Saucer', 22.00, 1, 22.00)
        `);

        await runAsync(db, `
            INSERT INTO orders (id, order_number, customer_name, customer_email, customer_phone, shipping_address, city, postal_code, payment_method, subtotal, shipping_fee, discount, total_amount, status, notes)
            VALUES (3, 'UWN-2026-1003', 'Kavinda Silva', 'kavinda.s@example.lk', '+94 76 554 3210', '88 Lighthouse Street, Galle Fort', 'Galle', '80000', 'Cash on Delivery', 24.00, 3.50, 0.00, 27.50, 'Pending', 'Gift package note: Happy Birthday Father.')
        `);
        await runAsync(db, `
            INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, total_price)
            VALUES (3, 8, 'Jumbo Green Ceylon Cardamom Pods', 24.00, 1, 24.00)
        `);
        console.log('[Seed] Inserted 3 orders and 5 order items.');

        // Inquiries
        const inquiries = [
            {
                ticket_number: 'INQ-8821',
                full_name: 'Michael Tan',
                email: 'michael.tan@artisancafes.sg',
                phone: '+65 9123 4567',
                subject: 'Boutique Cafe Wholesale Tea & Cinnamon Export Inquiry',
                message: 'Hello UWANI Team, we operate three specialty tea rooms in Singapore and are deeply impressed with your single-origin Pekoe and Alba cinnamon. We would like to request product specification sheets, lab testing certificates, and wholesale pricing for 25kg minimum orders.',
                status: 'New'
            },
            {
                ticket_number: 'INQ-8822',
                full_name: 'Rashmi Wickramasinghe',
                email: 'rashmi.w@greenfuture.lk',
                phone: '+94 77 987 6543',
                subject: 'Visiting smallholder organic gardens in Nuwara Eliya',
                message: 'Hi, we are conducting a university sustainability research project on organic agroforestry models at NSBM Green University. We would love to arrange a field visit to your smallholder partner gardens in Nuwara Eliya next month.',
                status: 'In Review'
            },
            {
                ticket_number: 'INQ-8823',
                full_name: 'Sahan Jayawardena',
                email: 'sahan.j@ceylonevents.com',
                phone: '+94 70 334 4556',
                subject: 'Custom corporate gift hampers for eco-symposium',
                message: 'We are organizing an international environmental conference in Colombo next November and require 120 custom eco-friendly gift boxes with the Ceylon tea, virgin coconut oil, and terracotta mug. Kindly share corporate catalogue options.',
                status: 'Replied'
            }
        ];

        for (const inq of inquiries) {
            await runAsync(db, `
                INSERT INTO inquiries (ticket_number, full_name, email, phone, subject, message, status)
                VALUES (?, ?, ?, ?, ?, ?, ?)
            `, [inq.ticket_number, inq.full_name, inq.email, inq.phone, inq.subject, inq.message, inq.status]);
        }
        console.log('[Seed] Inserted 3 customer inquiries.');

        console.log('✅ Database successfully initialized and seeded with complete sample records.');
        if (callback) callback(null, db);
        return db;
    } catch (err) {
        console.error('❌ Seeder error:', err);
        if (callback) callback(err);
        throw err;
    }
}

if (require.main === module) {
    initAndSeed().then(() => {
        process.exit(0);
    }).catch(() => {
        process.exit(1);
    });
}

module.exports = { initAndSeed, DB_PATH };
