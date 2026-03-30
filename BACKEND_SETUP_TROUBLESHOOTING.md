# Backend Setup & Troubleshooting Guide

## Current Configuration
- **Backend Port:** 5002
- **Frontend Port:** 5173
- **Database:** MongoDB (Local)
- **Database Name:** DraftinDB

---

## Step 1: Verify MongoDB is Running

### Windows - Check MongoDB Status
```powershell
# Check if MongoDB service is running
Get-Service MongoDB

# If not running, start it
Start-Service MongoDB

# Or if using MongoDB Community Edition
net start MongoDB
```

### Verify MongoDB Connection
```powershell
# Test MongoDB connection
mongosh
# or
mongo
```

If you see a connection error, MongoDB is not running.

---

## Step 2: Install Backend Dependencies

```bash
cd backend
npm install
```

This will install all required packages including:
- express (web framework)
- mongoose (MongoDB driver)
- bcrypt (password hashing)
- jsonwebtoken (JWT auth)
- cors (cross-origin requests)
- midtrans-client (payment gateway)

---

## Step 3: Verify .env Configuration

Check `backend/.env` contains:
```
PORT=5002
MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB
JWT_SECRET=rahasia_super_aman
MIDTRANS_IS_PRODUCTION=true
MIDTRANS_SERVER_KEY=YOUR_MIDTRANS_SERVER_KEY
MIDTRANS_CLIENT_KEY=YOUR_MIDTRANS_CLIENT_KEY
GOOGLE_CLIENT_ID=YOUR_GOOGLE_CLIENT_ID
GOOGLE_CLIENT_SECRET=YOUR_GOOGLE_CLIENT_SECRET
```

---

## Step 4: Start the Backend Server

### Option A: Development Mode (Recommended)
```bash
cd backend
npm run dev
```

You should see:
```
✅ MongoDB connected successfully
📍 Database: mongodb://127.0.0.1:27017/DraftinDB
✅ Server running on http://localhost:5002
🔗 CORS enabled for: http://localhost:5173
📊 Health check: http://localhost:5002/api/health
```

### Option B: Production Mode
```bash
cd backend
npm start
```

---

## Step 5: Test Backend Connection

### Test 1: Health Check
Open browser and go to:
```
http://localhost:5002/api/health
```

Expected response:
```json
{
  "status": "Server is running",
  "timestamp": "2024-02-21T10:30:00.000Z"
}
```

### Test 2: Create Admin User
```bash
cd backend
npm run create-admin
```

Expected output:
```
✅ Admin user created successfully
Email: admin@draftin.com
Password: admin123
```

---

## Step 6: Test Login

### Using Postman or cURL

**Register New User:**
```bash
curl -X POST http://localhost:5002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "password123",
    "phone": "08123456789"
  }'
```

**Login:**
```bash
curl -X POST http://localhost:5002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@draftin.com",
    "password": "admin123"
  }'
```

Expected response:
```json
{
  "message": "Login berhasil",
  "user": {
    "id": "...",
    "username": "admin",
    "email": "admin@draftin.com",
    "role": "admin"
  },
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## Common Issues & Solutions

### Issue 1: "server tidak dapat dihubungi" (Server cannot be reached)

**Cause:** Backend is not running

**Solution:**
1. Open terminal in `backend` folder
2. Run `npm run dev`
3. Wait for "✅ Server running on http://localhost:5002"
4. Try login again

---

### Issue 2: "MongoDB connection error"

**Cause:** MongoDB is not running or connection string is wrong

**Solution:**
1. Start MongoDB service:
   ```powershell
   Start-Service MongoDB
   ```
2. Verify connection string in `.env`:
   ```
   MONGO_URL=mongodb://127.0.0.1:27017/DraftinDB
   ```
3. Test MongoDB connection:
   ```bash
   mongosh
   ```

---

### Issue 3: "Email tidak ditemukan" (Email not found)

**Cause:** User doesn't exist in database

**Solution:**
1. Create admin user:
   ```bash
   npm run create-admin
   ```
2. Or register a new user first
3. Use correct email and password

---

### Issue 4: "Password salah" (Wrong password)

**Cause:** Incorrect password

**Solution:**
1. Double-check password (case-sensitive)
2. For admin: use `admin123`
3. Reset password by creating new admin user

---

### Issue 5: CORS Error in Browser Console

**Cause:** Frontend and backend not properly configured

**Solution:**
1. Verify backend is running on port 5002
2. Verify frontend is running on port 5173
3. Check `.env` has correct PORT
4. Restart both servers

---

## Complete Startup Sequence

### Terminal 1: Start MongoDB
```powershell
Start-Service MongoDB
```

### Terminal 2: Start Backend
```bash
cd backend
npm install  # First time only
npm run dev
```

Wait for:
```
✅ MongoDB connected successfully
✅ Server running on http://localhost:5002
```

### Terminal 3: Start Frontend
```bash
cd frontend
npm install  # First time only
npm run dev
```

Wait for:
```
VITE v... ready in ... ms
➜  Local:   http://localhost:5173/
```

### Terminal 4: Test in Browser
1. Open `http://localhost:5173`
2. Click "Login"
3. Use credentials:
   - Email: `admin@draftin.com`
   - Password: `admin123`
4. Should redirect to admin dashboard

---

## Database Structure

### Users Collection
```javascript
{
  _id: ObjectId,
  username: String,
  email: String,
  number: String,
  phone: String,
  address: String,
  photo: String,
  password: String (hashed),
  role: "admin" | "customer",
  createdAt: Date,
  updatedAt: Date
}
```

### Admin User (Created by npm run create-admin)
```javascript
{
  username: "admin",
  email: "admin@draftin.com",
  password: "admin123" (hashed),
  role: "admin"
}
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `POST /api/auth/google` - Google OAuth login

### Health Check
- `GET /api/health` - Server status

### Protected Routes (Require JWT Token)
- `GET /api/users` - Get all users
- `GET /api/products` - Get all products
- `POST /api/cart` - Add to cart
- `GET /api/orders` - Get user orders
- `POST /api/complaints` - Create complaint

---

## Debugging Tips

### Enable Detailed Logging
Add this to `backend/index.js` after CORS setup:
```javascript
app.use((req, res, next) => {
  console.log(`📨 ${req.method} ${req.path}`);
  console.log('📦 Body:', req.body);
  next();
});
```

### Check Network Requests
1. Open browser DevTools (F12)
2. Go to Network tab
3. Try login
4. Check request/response details

### MongoDB Query Debugging
```bash
mongosh
use DraftinDB
db.users.find()
db.users.findOne({ email: "admin@draftin.com" })
```

---

## Next Steps

Once backend is running successfully:

1. ✅ Test login with admin account
2. ✅ Test register new user
3. ✅ Test add to cart
4. ✅ Test checkout with Midtrans
5. ✅ Test admin dashboard
6. ✅ Test complaint submission

---

## Support

If you still have issues:

1. Check console output for error messages
2. Verify all services are running (MongoDB, Backend, Frontend)
3. Check network tab in browser DevTools
4. Verify `.env` configuration
5. Check MongoDB database has data

