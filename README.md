# UWANI Ceylon Organics & Lifestyle

A full-stack sustainable e-commerce web platform and administrative management portal celebrating Sri Lanka's indigenous agricultural heritage.

The platform provides a direct-to-consumer digital commerce experience for single-estate Ceylon teas, true Alba cinnamon, virgin coconut care, and handcrafted terracotta pottery, backed by a persistent relational database demonstrating complete Data Manipulation Language (DML) operations.

---

## Key Features

- **Responsive Ceylon Storefront:** Designed with a curated organic palette (Forest Pine, Ceylon Gold, Sand Canvas) and typography (Cinzel & Plus Jakarta Sans).
- **Dual Currency Engine:** Defaults to **Sri Lankan Rupees (LKR / Rs.)** with live toggle conversion to **US Dollars (USD / $)** across catalog, cart, and checkout.
- **Dynamic Catalog Filtering:** Real-time search by keyword, category pill filtering, and sorting by price or ratings without full page reloads.
- **Interactive Shopping Basket:** Sliding cart drawer powered by LocalStorage, automated discount coupon (`GREEN10`), and stock decrementing upon order placement.
- **Customer Support Desk:** Contact inquiry ticketing system with automated reference tracking code generation (`INQ-XXXX`).
- **Administrative Portal:** Executive dashboard with live KPI counters (Revenue, Orders, Products, Inquiries), full Product inventory CRUD, order fulfillment status manager, and an interactive raw SQL query console.
- **Zero-Dependency Relational Database:** Powered by SQLite (`database/uwani.db`) with relational integrity, foreign key constraints, and full DML support (`INSERT`, `SELECT`, `UPDATE`, `DELETE`).

---

## Technology Stack

- **Frontend:** HTML5, CSS3 (Vanilla CSS variables), Vanilla JavaScript (ES6+)
- **Backend:** Node.js, Express.js
- **Database:** SQLite3
- **Icons & Typography:** Remix Icon, Google Fonts (Cinzel, Plus Jakarta Sans)

---

## Project Structure

```text
UWANI /
├── database/
│   ├── schema.sql         # Database schema (5 relational tables)
│   ├── seed.js            # Initial seed population script
│   └── uwani.db           # Persistent SQLite database file
├── public/
│   ├── index.html         # Storefront home page
│   ├── shop.html          # Product catalog with search and filters
│   ├── about.html         # Heritage & agroforestry story
│   ├── contact.html       # Customer relations & inquiry ticketing
│   ├── admin.html         # Administrative dashboard & management suite
│   ├── css/
│   │   ├── style.css      # Core brand design system
│   │   └── admin.css      # Admin dashboard stylesheet
│   ├── js/
│   │   ├── main.js        # Cart engine, currency switcher, checkout
│   │   ├── shop.js        # Catalog search and filter controller
│   │   ├── contact.js     # Form validation and ticket generator
│   │   └── admin.js       # Administrative CRUD & SQL console
│   └── images/
│       ├── hero-banner.svg
│       └── products/      # 8 SVG product vector illustrations
├── server.js              # Express REST server & DML handlers
├── package.json           # Project metadata & dependencies
└── README.md
```

---

## Getting Started

### Prerequisites

- Node.js (v18.0.0 or later)
- npm (Node Package Manager)

### Installation & Launch

1. Clone the repository:
   ```bash
   git clone https://github.com/uwanikeshara/uwani-ceylon-organics.git
   cd uwani-ceylon-organics
   ```

2. Install dependencies:
   ```bash
   npm install
   ```

3. (Optional) Re-seed the database:
   ```bash
   npm run seed
   ```

4. Start the server:
   ```bash
   npm start
   ```

5. Open your web browser and visit:
   - **Storefront:** [http://localhost:3000](http://localhost:3000)
   - **Admin Management Portal:** [http://localhost:3000/admin.html](http://localhost:3000/admin.html)

---

## License

This project is licensed under the MIT License.
