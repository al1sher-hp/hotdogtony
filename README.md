# 🌭 Hotdog Shahobcha - Raqamli Tizim

Hot dog shahobchasi uchun to'liq raqamli buyurtma boshqaruv tizimi. Mijozlar, hodimlar, boshliq va super-admin uchun alohida interfeyslar.

## 🚀 Xususiyatlar

### Mijoz Tizimi
- ✅ Email magic link autentifikatsiya
- ✅ Menu ko'rish va mahsulot tanlash
- ✅ Savat va buyurtma berish
- ✅ QR kod generatsiya
- ✅ Buyurtma statusini real-time kuzatish
- ✅ Profil (buyurtma tarixi, sevimli mahsulotlar)
- ✅ Feedback tizimi (5 yulduzcha + komment)

### Hodim Paneli
- ✅ Email/password autentifikatsiya  
- ✅ QR kod skanerlash (kamera bilan)
- ✅ Buyurtmalarni tasdiqlash
- ✅ Buyurtmalarni "Tayyor" qilish
- ✅ Real-time yangilanishlar

### Ekran Sahifasi
- ✅ "Tayyorlanmoqda" va "Tayyor" bo'limlari
- ✅ Ism-raqam formatida ko'rsatish
- ✅ Kunlik raqam avtomatik reset
- ✅ Real-time yangilanish
- ✅ Ovozli signal (buyurtma tayyor bo'lganda)

### Boshliq Dashboard
- ✅ Kunlik/haftalik/oylik statistika
- ✅ Chart.js grafiklar
- ✅ Excel export
- ✅ Menu boshqaruvi (CRUD, rasm yuklash)
- ✅ Hodim boshqaruvi
- ✅ Masalliq monitoringi
- ✅ Feedback ko'rish

### Super Admin
- ✅ Barcha ma'lumotlarga to'liq kirish
- ✅ CRUD operatsiyalar (users, orders, menu, ingredients, feedback)

## 📋 Texnologiyalar

### Backend
- Node.js + Express
- MongoDB + Mongoose
- Socket.io (real-time)
- JWT autentifikatsiya
- Nodemailer (Gmail SMTP)
- ImgBB API (rasm yuklash)
- QRCode

### Frontend
- React 18
- React Router v6
- Tailwind CSS + daisyUI
- Socket.io Client
- Chart.js + react-chartjs-2
- html5-qrcode (QR skanerlash)
- react-icons
- qrcode.react
- Axios

## 🛠️ O'rnatish

### 1. Clone qilish
```bash
git clone <repository-url>
cd hotdogtony
```

### 2. Backend sozlash
```bash
cd server
npm install

# .env faylini yarating
cp .env.example .env
# .env faylida quyidagilarni to'ldiring:
# - MONGODB_URI (MongoDB Atlas connection string)
# - JWT_SECRET (random secret key)
# - EMAIL_USER (Gmail email)
# - EMAIL_APP_PASSWORD (Gmail App Password)
# - IMGBB_API_KEY (ImgBB API key)
```

### 3. Frontend sozlash
```bash
cd ../client
npm install

# .env faylini yarating
cp .env.example .env
# Default: REACT_APP_API_URL=http://localhost:5000/api
```

### 4. Ishga tushirish (Development)

**Terminal 1 - Backend:**
```bash
cd server
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd client
npm start
```

Frontend: http://localhost:3000  
Backend: http://localhost:5000

## 🔑 Default Credentials

### Super Admin
- Email: `admin@hotdog.uz`
- Password: `admin123`

### Test uchun hodim/boshliq yaratish:
Super Admin panelidan yoki MongoDB'dan to'g'ridan-to'g'ri qo'shing.

## 📝 Gmail SMTP Setup

1. Gmail hisobingizga kiring
2. Security sozlamalariga o'ting
3. 2-Step Verification yoqing
4. "App passwords" yarating
5. Generate qilingan parolni `.env` faylida `EMAIL_APP_PASSWORD` ga yozing

## 🖼️ ImgBB API Setup

1. https://imgbb.com ga tashrif buying
2. Ro'yxatdan o'ting
3. API key oling
4. `.env` faylida `IMGBB_API_KEY` ga yozing

## 📱 MongoDB Atlas Setup

1. https://mongodb.com/cloud/atlas ga kiring
2. Free cluster yarating
3. Database user yarating
4. Network Access: IP whitelist (0.0.0.0/0 - development uchun)
5. Connection string olling
6. `.env` faylida `MONGODB_URI` ga yozing

## 🚀 Deployment

### Frontend - Vercel

1. GitHub repository yarating
2. Push qiling
3. Vercel.com ga kiring
4. Import repository
5. Environment variables qo'shing:
   - `REACT_APP_API_URL` = Render backend URL + `/api`
6. Deploy!

### Backend - Render

1. GitHub repository yarating (yoki yuqoridagi bilan bir xil)
2. Render.com ga kiring
3. New Web Service yarating
4. Repository tanglang
5. Environment variables qo'shing:
   - `MONGODB_URI`
   - `JWT_SECRET`
   - `EMAIL_USER`
   - `EMAIL_APP_PASSWORD`
   - `IMGBB_API_KEY`
   - `CLIENT_URL` = Vercel frontend URL
   - `NODE_ENV` = production
6. Deploy!

**IMPORTANT:** Render free tier 15 daqiqadan keyin sleep mode kirad. Production uchun Starter plan yoki Railway.app tavsiya etiladi.

## 📁 Loyiha Strukturasi

```
hotdogtony/
├── server/                 # Backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth & role check
│   ├── utils/             # Helper functions
│   ├── server.js          # Main server file
│   └── package.json
├── client/                 # Frontend
│   ├── public/
│   ├── src/
│   │   ├── components/    # React components
│   │   ├── pages/         # Page components
│   │   ├── contexts/      # React contexts
│   │   ├── utils/         # API & socket utils
│   │   ├── App.js
│   │   └── index.js
│   └── package.json
└── README.md
```

## 🎯 API Endpoints

### Auth
- `POST /api/auth/send-magic-link` - Magic link yuborish
- `GET /api/auth/verify-magic-link/:token` - Magic link tasdiqlash
- `POST /api/auth/login` - Staff login
- `GET /api/auth/me` - Current user

### Orders
- `POST /api/orders` - Yangi buyurtma
- `GET /api/orders` - Barcha buyurtmalar (role-based)
- `GET /api/orders/:id` - Bitta buyurtma
- `PATCH /api/orders/:id/confirm` - Tasdiqlash
- `PATCH /api/orders/:id/ready` - Tayyor qilish
- `POST /api/orders/verify-qr` - QR tekshirish

### Menu
- `GET /api/menu` - Barcha menu items
- `POST /api/menu` - Yangi item (boss)
- `PATCH /api/menu/:id` - Tahrirlash (boss)
- `DELETE /api/menu/:id` - O'chirish (boss)
- `POST /api/menu/upload-image` - Rasm yuklash

### Users
- `GET /api/users` - Barcha users (boss/super-admin)
- `POST /api/users` - Yangi user
- `PATCH /api/users/:id` - Tahrirlash
- `DELETE /api/users/:id` - O'chirish
- `PATCH /api/users/favorites/toggle` - Sevimli qo'shish/o'chirish

### Ingredients
- `GET /api/ingredients` - Barcha masalliqlar
- `POST /api/ingredients` - Yangi masalliq
- `PATCH /api/ingredients/:id` - Tahrirlash
- `DELETE /api/ingredients/:id` - O'chirish

### Feedback
- `POST /api/feedback` - Feedback yuborish
- `GET /api/feedback` - Barcha feedback (boss)
- `GET /api/feedback/order/:orderId` - Buyurtma feedbacki

### Reports
- `GET /api/reports/stats?period=daily|weekly|monthly` - Statistika
- `GET /api/reports/export?period=...&type=orders|feedback` - Export

## 🎨 Dizayn

- Modern, professional UI
- daisyUI theming ("hotdog" custom theme)
- Responsive (telefon, planshet, smart TV)
- Smooth animatsiyalar
- Loading states
- Toast notifications
- Error handling

## 🔄 Real-time Events (Socket.io)

- `newOrder` - Yangi buyurtma (employee/display)
- `orderUpdated` - Status o'zgardi (customer/display)
- `orderReady` - Tayyor bo'ldi (customer/display + sound)

## 🐛 Troubleshooting

**Backend ishlamayapti:**
- MongoDB connection stringni tekshiring
- .env faylida barcha o'zgaruvchilar borligini tekshiring
- Port 5000 band emasligini tekshiring

**Frontend build error:**
- `npm install` qaytadan ishga tushiring
- Node.js versiyasini tekshiring (v16+ kerak)

**Email yuborilmayapti:**
- Gmail App Password to'g'riligini tekshiring
- 2-Step Verification yoqilganligini tekshiring

**QR skanerlash ishlamayapti:**
- HTTPS yoki localhost kerak (kamera uchun)
- Browserda kamera ruxsatini bering

## 📄 License

MIT

## 👨‍💻 Muallif

AL1SHER

---

**Hotdog Shahobcha** - Professional raqamli buyurtma boshqaruv tizimi 🌭
