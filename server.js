/**
 * =====================================================================
 * UWANI CEYLON ORGANICS & LIFESTYLE PLATFORM
 * Web Application Development - Main Express Server
 * NSBM Green University Town
 * Module Leader: S. Naji
 * =====================================================================
 */

const express = require('express');
const cors = require('cors');
const path = require('path');
const fs = require('fs');
const sqlite3 = require('sqlite3').verbose();
const { initAndSeed, DB_PATH } = require('./database/seed');

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Ensure database exists; if not, seed it automatically
if (!fs.existsSync(DB_PATH)) {
    console.log('[Server] Database not found. Running seed script...');
    initAndSeed();
}

// Database Helper
function getDb() {
    return new sqlite3.Database(DB_PATH);
}

// =====================================================================
// API ROUTES: PRODUCTS (CRUD / DML)
// =====================================================================

// 1. SELECT Products (with category, search and sort filtering)
app.get('/api/products', (req, res) => {
    const db = getDb();
    const { category, search, sort, featured } = req.query;

    let sql = `
        SELECT p.*, c.name AS category_name, c.slug AS category_slug 
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE 1=1
    `;
    const params = [];

    if (category && category !== 'all') {
        sql += ` AND (c.slug = ? OR c.name = ?)`;
        params.push(category, category);
    }

    if (search) {
        sql += ` AND (p.name LIKE ? OR p.short_desc LIKE ? OR p.description LIKE ? OR p.sku LIKE ?)`;
        const q = `%${search}%`;
        params.push(q, q, q, q);
    }

    if (featured === '1' || featured === 'true') {
        sql += ` AND p.is_featured = 1`;
    }

    // Sorting
    if (sort === 'price_asc') {
        sql += ` ORDER BY p.price ASC`;
    } else if (sort === 'price_desc') {
        sql += ` ORDER BY p.price DESC`;
    } else if (sort === 'rating') {
        sql += ` ORDER BY p.rating DESC`;
    } else if (sort === 'name') {
        sql += ` ORDER BY p.name ASC`;
    } else {
        sql += ` ORDER BY p.id DESC`;
    }

    db.all(sql, params, (err, rows) => {
        db.close();
        if (err) {
            console.error('[DML SELECT Products Error]:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.json({ success: true, count: rows.length, data: rows });
    });
});

// 2. SELECT Single Product by ID
app.get('/api/products/:id', (req, res) => {
    const db = getDb();
    const sql = `
        SELECT p.*, c.name AS category_name, c.slug AS category_slug 
        FROM products p
        JOIN categories c ON p.category_id = c.id
        WHERE p.id = ?
    `;
    db.get(sql, [req.params.id], (err, row) => {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (!row) return res.status(404).json({ success: false, error: 'Product not found' });
        res.json({ success: true, data: row });
    });
});

// 3. INSERT Product (DML INSERT)
app.post('/api/products', (req, res) => {
    const db = getDb();
    const {
        category_id, sku, name, short_desc, description,
        price, stock_quantity, image_url, badge, is_featured, origin
    } = req.body;

    if (!name || !price || !category_id) {
        return res.status(400).json({ success: false, error: 'Name, price, and category are required.' });
    }

    const generatedSku = sku || `UWN-GEN-${Date.now().toString().slice(-4)}`;
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)+/g, '');
    const img = image_url || '/images/products/tea-pekoe.svg';

    const sql = `
        INSERT INTO products 
        (category_id, sku, name, slug, short_desc, description, price, stock_quantity, rating, review_count, image_url, badge, is_featured, origin)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 5.0, 1, ?, ?, ?, ?)
    `;

    db.run(sql, [
        category_id, generatedSku, name, slug,
        short_desc || name, description || short_desc || name,
        parseFloat(price), parseInt(stock_quantity || 10, 10),
        img, badge || '', is_featured ? 1 : 0, origin || 'Sri Lanka'
    ], function (err) {
        db.close();
        if (err) {
            console.error('[DML INSERT Product Error]:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.status(201).json({
            success: true,
            message: 'Product created successfully',
            productId: this.lastID
        });
    });
});

// 4. UPDATE Product (DML UPDATE)
app.put('/api/products/:id', (req, res) => {
    const db = getDb();
    const {
        category_id, name, short_desc, description,
        price, stock_quantity, image_url, badge, is_featured, origin
    } = req.body;

    const sql = `
        UPDATE products 
        SET category_id = COALESCE(?, category_id),
            name = COALESCE(?, name),
            short_desc = COALESCE(?, short_desc),
            description = COALESCE(?, description),
            price = COALESCE(?, price),
            stock_quantity = COALESCE(?, stock_quantity),
            image_url = COALESCE(?, image_url),
            badge = COALESCE(?, badge),
            is_featured = COALESCE(?, is_featured),
            origin = COALESCE(?, origin),
            updated_at = CURRENT_TIMESTAMP
        WHERE id = ?
    `;

    db.run(sql, [
        category_id, name, short_desc, description,
        price !== undefined ? parseFloat(price) : null,
        stock_quantity !== undefined ? parseInt(stock_quantity, 10) : null,
        image_url, badge, is_featured !== undefined ? (is_featured ? 1 : 0) : null,
        origin, req.params.id
    ], function (err) {
        db.close();
        if (err) {
            console.error('[DML UPDATE Product Error]:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product updated successfully' });
    });
});

// 5. DELETE Product (DML DELETE)
app.delete('/api/products/:id', (req, res) => {
    const db = getDb();
    const sql = `DELETE FROM products WHERE id = ?`;

    db.run(sql, [req.params.id], function (err) {
        db.close();
        if (err) {
            console.error('[DML DELETE Product Error]:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        if (this.changes === 0) {
            return res.status(404).json({ success: false, error: 'Product not found' });
        }
        res.json({ success: true, message: 'Product deleted successfully' });
    });
});

// =====================================================================
// API ROUTES: CATEGORIES (SELECT)
// =====================================================================
app.get('/api/categories', (req, res) => {
    const db = getDb();
    const sql = `
        SELECT c.*, COUNT(p.id) AS product_count 
        FROM categories c
        LEFT JOIN products p ON c.id = p.category_id
        GROUP BY c.id
        ORDER BY c.name ASC
    `;
    db.all(sql, [], (err, rows) => {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: rows });
    });
});

// =====================================================================
// API ROUTES: ORDERS (CRUD / DML)
// =====================================================================

// 1. SELECT Orders (with line item details)
app.get('/api/orders', (req, res) => {
    const db = getDb();
    const sql = `SELECT * FROM orders ORDER BY id DESC`;

    db.all(sql, [], (err, orders) => {
        if (err) {
            db.close();
            return res.status(500).json({ success: false, error: err.message });
        }

        if (orders.length === 0) {
            db.close();
            return res.json({ success: true, count: 0, data: [] });
        }

        // Fetch items for each order
        db.all(`SELECT * FROM order_items`, [], (err2, items) => {
            db.close();
            if (err2) return res.status(500).json({ success: false, error: err2.message });

            const itemsByOrder = {};
            items.forEach(it => {
                if (!itemsByOrder[it.order_id]) itemsByOrder[it.order_id] = [];
                itemsByOrder[it.order_id].push(it);
            });

            const enrichedOrders = orders.map(ord => ({
                ...ord,
                items: itemsByOrder[ord.id] || []
            }));

            res.json({ success: true, count: enrichedOrders.length, data: enrichedOrders });
        });
    });
});

// 2. INSERT Order (DML INSERT & inventory UPDATE)
app.post('/api/orders', (req, res) => {
    const db = getDb();
    const {
        customer_name, customer_email, customer_phone,
        shipping_address, city, postal_code, payment_method,
        items, subtotal, shipping_fee, discount, total_amount, notes
    } = req.body;

    if (!customer_name || !customer_email || !shipping_address || !items || !items.length) {
        return res.status(400).json({ success: false, error: 'Customer details and cart items are required.' });
    }

    const orderNumber = `UWN-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`;

    db.serialize(() => {
        const orderSql = `
            INSERT INTO orders 
            (order_number, customer_name, customer_email, customer_phone, shipping_address, city, postal_code, payment_method, subtotal, shipping_fee, discount, total_amount, status, notes)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'Pending', ?)
        `;

        db.run(orderSql, [
            orderNumber, customer_name, customer_email, customer_phone,
            shipping_address, city || 'Colombo', postal_code || '',
            payment_method || 'Cash on Delivery',
            parseFloat(subtotal || 0), parseFloat(shipping_fee || 0),
            parseFloat(discount || 0), parseFloat(total_amount || 0),
            notes || ''
        ], function (err) {
            if (err) {
                db.close();
                console.error('[DML INSERT Order Error]:', err.message);
                return res.status(500).json({ success: false, error: err.message });
            }

            const orderId = this.lastID;
            const itemStmt = db.prepare(`
                INSERT INTO order_items (order_id, product_id, product_name, unit_price, quantity, total_price)
                VALUES (?, ?, ?, ?, ?, ?)
            `);

            // Also reduce product stock (DML UPDATE)
            const updateStockStmt = db.prepare(`
                UPDATE products 
                SET stock_quantity = MAX(0, stock_quantity - ?)
                WHERE id = ?
            `);

            items.forEach(it => {
                const qty = parseInt(it.quantity || 1, 10);
                const price = parseFloat(it.price || 0);
                itemStmt.run(orderId, it.id, it.name, price, qty, qty * price);
                updateStockStmt.run(qty, it.id);
            });

            itemStmt.finalize();
            updateStockStmt.finalize(() => {
                db.close();
                res.status(201).json({
                    success: true,
                    message: 'Order placed successfully',
                    orderNumber,
                    orderId
                });
            });
        });
    });
});

// 3. UPDATE Order Status (DML UPDATE)
app.put('/api/orders/:id/status', (req, res) => {
    const db = getDb();
    const { status } = req.body;

    const allowed = ['Pending', 'Processing', 'Dispatched', 'Delivered', 'Cancelled'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    db.run(`UPDATE orders SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, message: `Order status updated to ${status}` });
    });
});

// 4. DELETE Order (DML DELETE)
app.delete('/api/orders/:id', (req, res) => {
    const db = getDb();
    db.run(`DELETE FROM orders WHERE id = ?`, [req.params.id], function (err) {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Order not found' });
        res.json({ success: true, message: 'Order deleted successfully' });
    });
});

// =====================================================================
// API ROUTES: INQUIRIES / CONTACT (CRUD / DML)
// =====================================================================

// 1. SELECT Inquiries
app.get('/api/inquiries', (req, res) => {
    const db = getDb();
    db.all(`SELECT * FROM inquiries ORDER BY id DESC`, [], (err, rows) => {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, count: rows.length, data: rows });
    });
});

// 2. INSERT Inquiry (DML INSERT)
app.post('/api/inquiries', (req, res) => {
    const db = getDb();
    const { full_name, email, phone, subject, message } = req.body;

    if (!full_name || !email || !subject || !message) {
        return res.status(400).json({ success: false, error: 'Name, email, subject, and message are required.' });
    }

    const ticketNumber = `INQ-${Math.floor(1000 + Math.random() * 9000)}`;

    const sql = `
        INSERT INTO inquiries (ticket_number, full_name, email, phone, subject, message, status)
        VALUES (?, ?, ?, ?, ?, ?, 'New')
    `;

    db.run(sql, [ticketNumber, full_name, email, phone || '', subject, message], function (err) {
        db.close();
        if (err) {
            console.error('[DML INSERT Inquiry Error]:', err.message);
            return res.status(500).json({ success: false, error: err.message });
        }
        res.status(201).json({
            success: true,
            message: 'Inquiry submitted successfully',
            ticketNumber,
            inquiryId: this.lastID
        });
    });
});

// 3. UPDATE Inquiry Status (DML UPDATE)
app.put('/api/inquiries/:id/status', (req, res) => {
    const db = getDb();
    const { status } = req.body;

    const allowed = ['New', 'In Review', 'Replied', 'Closed'];
    if (!allowed.includes(status)) {
        return res.status(400).json({ success: false, error: `Invalid status. Allowed: ${allowed.join(', ')}` });
    }

    db.run(`UPDATE inquiries SET status = ? WHERE id = ?`, [status, req.params.id], function (err) {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Inquiry not found' });
        res.json({ success: true, message: `Inquiry status updated to ${status}` });
    });
});

// 4. DELETE Inquiry (DML DELETE)
app.delete('/api/inquiries/:id', (req, res) => {
    const db = getDb();
    db.run(`DELETE FROM inquiries WHERE id = ?`, [req.params.id], function (err) {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        if (this.changes === 0) return res.status(404).json({ success: false, error: 'Inquiry not found' });
        res.json({ success: true, message: 'Inquiry deleted successfully' });
    });
});

// =====================================================================
// API ROUTES: ANALYTICS / ADMIN STATS
// =====================================================================
app.get('/api/stats', (req, res) => {
    const db = getDb();

    const sql = `
        SELECT 
            (SELECT COUNT(*) FROM products) AS total_products,
            (SELECT COUNT(*) FROM orders) AS total_orders,
            (SELECT COALESCE(SUM(total_amount), 0) FROM orders WHERE status != 'Cancelled') AS total_revenue,
            (SELECT COUNT(*) FROM inquiries WHERE status = 'New') AS new_inquiries,
            (SELECT COUNT(*) FROM products WHERE stock_quantity <= 15) AS low_stock_count
    `;

    db.get(sql, [], (err, row) => {
        db.close();
        if (err) return res.status(500).json({ success: false, error: err.message });
        res.json({ success: true, data: row });
    });
});

// =====================================================================
// API ROUTES: DATABASE CONSOLE & SEED UTILITY
// =====================================================================

// 1. Reset & Re-seed Database
app.post('/api/database/reset', async (req, res) => {
    try {
        await initAndSeed();
        res.json({ success: true, message: 'Database reset to default seed state successfully.' });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

// 2. Direct SQL Query Console (Demonstrating raw DML queries for grading)
app.post('/api/database/query', (req, res) => {
    const { query } = req.body;
    if (!query || typeof query !== 'string') {
        return res.status(400).json({ success: false, error: 'SQL query string required.' });
    }

    const trimmed = query.trim();
    const isSelect = /^SELECT/i.test(trimmed) || /^PRAGMA/i.test(trimmed);

    const db = getDb();
    if (isSelect) {
        db.all(trimmed, [], (err, rows) => {
            db.close();
            if (err) return res.status(400).json({ success: false, error: err.message });
            res.json({ success: true, type: 'SELECT', rowCount: rows.length, data: rows });
        });
    } else {
        db.run(trimmed, [], function (err) {
            db.close();
            if (err) return res.status(400).json({ success: false, error: err.message });
            res.json({
                success: true,
                type: 'DML/DDL',
                changes: this.changes,
                lastID: this.lastID,
                message: `Query executed. Rows affected: ${this.changes}`
            });
        });
    }
});

// Start Server
app.listen(PORT, () => {
    console.log(`================================================================`);
    console.log(`🌿 UWANI Ceylon Organics & Lifestyle Web Application`);
    console.log(`🎓 NSBM Green University - Web Application Development`);
    console.log(`🚀 Server running on: http://localhost:${PORT}`);
    console.log(`💻 Admin Dashboard:  http://localhost:${PORT}/admin.html`);
    console.log(`================================================================`);
});
