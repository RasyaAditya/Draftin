# Design Document - LYNK Learning Platform Transformation

## Overview

This design transforms DRAFTin from an e-commerce platform into a LYNK-style learning platform. The system focuses on digital learning products with cloud storage links, simplified purchasing, and social engagement features. Key architectural changes include removing address-based logistics, adding drive link delivery, and implementing social feeds on the About page.

## Architecture

### System Components

```
┌─────────────────────────────────────────────────────────────┐
│                     Frontend (Vue 3)                         │
├─────────────────────────────────────────────────────────────┤
│  • Shop/Products View (no stock display)                    │
│  • Simplified Checkout (no address)                         │
│  • Order History with Drive Links                           │
│  • About Page with Feeds/Reels                              │
│  • Admin Dashboard (Products, Feeds, Orders, Complaints)    │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                  Backend (Node.js/Express)                   │
├─────────────────────────────────────────────────────────────┤
│  • Product API (no stock field, add driveLink)              │
│  • Order API (simplified, no address)                       │
│  • Feed/Reel API (CRUD operations)                          │
│  • Complaint API (no delivery options)                      │
│  • Payment Webhook (deliver drive link on success)          │
└─────────────────────────────────────────────────────────────┘
                            ↓
┌─────────────────────────────────────────────────────────────┐
│                    Database (MongoDB)                        │
├─────────────────────────────────────────────────────────────┤
│  • Products (name, description, price, driveLink, image)   │
│  • Orders (userId, products, totalPrice, paymentStatus)    │
│  • Feeds/Reels (title, description, image/video, admin)    │
│  • Complaints (subject, message, category - no delivery)    │
└─────────────────────────────────────────────────────────────┘
```

## Components and Interfaces

### Frontend Components

#### 1. Product Card Component
- Display: product name, description, price, preview image
- Remove: stock information
- Action: Add to cart button

#### 2. Checkout Component
- Fields: Product list, quantity, total price
- Remove: Address fields
- Action: Proceed to payment

#### 3. Order History Component
- Display: Product name, purchase date, drive link
- Action: Click drive link to open in new tab
- Status: Show payment status

#### 4. Feed/Reel Component (About Page)
- Display: Image/video, title, description, admin name
- Layout: Grid or carousel
- Action: View full content

#### 5. Admin Dashboard Sections
- Products: Create/edit/delete with drive link field
- Feeds/Reels: Upload images/videos with descriptions
- Orders: View orders without address
- Complaints: Filter non-delivery complaints

### Backend API Endpoints

#### Products
- `POST /api/products` - Create product (with driveLink)
- `GET /api/products` - List all products
- `GET /api/products/:id` - Get product details
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

#### Orders
- `POST /api/orders` - Create order (no address)
- `GET /api/orders` - List orders
- `GET /api/orders/:id` - Get order details
- `PATCH /api/orders/:id/status` - Update order status

#### Feeds/Reels
- `POST /api/feeds` - Create feed/reel
- `GET /api/feeds` - List all feeds
- `DELETE /api/feeds/:id` - Delete feed
- `PUT /api/feeds/:id` - Update feed

#### Complaints
- `POST /api/complaints` - Create complaint (no delivery option)
- `GET /api/complaints` - List complaints
- `GET /api/complaints/:id` - Get complaint details

## Data Models

### Product Model
```javascript
{
  _id: ObjectId,
  name: String (required),
  description: String,
  price: Number (required),
  driveLink: String (required), // Google Drive or cloud storage link
  image: String (base64 or URL),
  category: String,
  createdAt: Date,
  updatedAt: Date
}
```

### Order Model
```javascript
{
  _id: ObjectId,
  orderNumber: String (unique),
  userId: ObjectId (reference to User),
  products: [
    {
      productId: ObjectId,
      name: String,
      price: Number,
      driveLink: String
    }
  ],
  totalPrice: Number,
  paymentStatus: String (paid/unpaid),
  status: String (pending/processing/completed),
  createdAt: Date,
  updatedAt: Date
  // NO address field
}
```

### Feed/Reel Model
```javascript
{
  _id: ObjectId,
  title: String (required),
  description: String,
  image: String (base64 or URL),
  video: String (URL or base64),
  type: String (feed/reel),
  adminId: ObjectId (reference to Admin),
  isActive: Boolean,
  createdAt: Date,
  updatedAt: Date
}
```

### Complaint Model
```javascript
{
  _id: ObjectId,
  subject: String (required),
  message: String (required),
  category: String (product-quality/content-issue/technical-problem),
  // NO delivery category
  userId: ObjectId,
  userName: String,
  userEmail: String,
  priority: String (low/medium/high/urgent),
  status: String (new/read/responded),
  createdAt: Date,
  updatedAt: Date
}
```

## Correctness Properties

A property is a characteristic or behavior that should hold true across all valid executions of a system—essentially, a formal statement about what the system should do. Properties serve as the bridge between human-readable specifications and machine-verifiable correctness guarantees.

### Property 1: Drive Link Delivery on Payment
*For any* successful payment, the system SHALL provide the purchased product's drive link to the user immediately.
**Validates: Requirements 7.1, 7.2, 7.3**

### Property 2: No Address in Orders
*For any* order created in the system, the order SHALL NOT contain address information.
**Validates: Requirements 2.3, 2.4**

### Property 3: Product Stock Removal
*For any* product in the system, the product SHALL NOT have a stock field or stock-related information.
**Validates: Requirements 1.1, 1.4**

### Property 4: Complaint Category Filtering
*For any* complaint submitted, the system SHALL only accept non-delivery complaint categories (product-quality, content-issue, technical-problem).
**Validates: Requirements 3.1, 3.2**

### Property 5: Feed/Reel Admin-Only Upload
*For any* feed or reel in the system, it SHALL only be created by admin users through the dashboard.
**Validates: Requirements 4.1, 4.2**

### Property 6: Drive Link Persistence
*For any* purchased product, the drive link SHALL remain accessible in the order history indefinitely.
**Validates: Requirements 1.3, 5.1, 5.2**

## Error Handling

### Product Management
- Invalid drive link format → Display error message
- Missing required fields → Prevent product creation
- Duplicate product names → Allow (different versions possible)

### Order Processing
- Payment failure → Maintain order in unpaid status
- Missing drive link → Display warning, allow manual link addition
- Invalid product reference → Prevent order creation

### Feed/Reel Management
- Invalid file format → Reject upload
- Missing title → Prevent creation
- Admin-only validation → Reject non-admin uploads

### Complaint Submission
- Invalid category selection → Show error
- Delivery category selection → Reject with message
- Missing required fields → Prevent submission

## Testing Strategy

### Unit Tests
- Product creation without stock field
- Order creation without address
- Drive link retrieval after payment
- Complaint category validation
- Feed/reel admin-only creation

### Property-Based Tests
- **Property 1**: For any payment, drive link is delivered
- **Property 2**: For any order, no address field exists
- **Property 3**: For any product, no stock field exists
- **Property 4**: For any complaint, category is non-delivery
- **Property 5**: For any feed, creator is admin
- **Property 6**: For any purchased product, drive link persists

### Integration Tests
- Complete purchase flow with drive link delivery
- Admin feed upload and display on About page
- Order history with drive links
- Complaint submission without delivery options

