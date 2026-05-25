/**
 * Firebase Seed Script
 * Default staff foydalanuvchilarini Firebase Auth + Firestore'ga qo'shadi
 *
 * Ishlatish:
 *   node seed.js
 *
 * Talablar:
 *   - .env faylida FIREBASE_SERVICE_ACCOUNT_PATH yoki
 *     FIREBASE_PROJECT_ID, FIREBASE_CLIENT_EMAIL, FIREBASE_PRIVATE_KEY bo'lishi kerak
 *
 * Bu skriptni faqat bir marta ishlatish kerak!
 */

const { initializeApp, cert } = require('firebase-admin/app');
const { getAuth } = require('firebase-admin/auth');
const { getFirestore } = require('firebase-admin/firestore');
const path = require('path');

// Service Account ni .env dan yoki fayl sifatida o'qish
require('dotenv').config();

let serviceAccount;
if (process.env.FIREBASE_SERVICE_ACCOUNT_PATH) {
    serviceAccount = require(path.resolve(process.env.FIREBASE_SERVICE_ACCOUNT_PATH));
} else {
    serviceAccount = {
        projectId: process.env.FIREBASE_PROJECT_ID,
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
        privateKey: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    };
}

initializeApp({ credential: cert(serviceAccount) });

const adminAuth = getAuth();
const db = getFirestore();

const STAFF_USERS = [
    {
        name: 'Super Admin',
        email: 'admin@hotdog.uz',
        password: 'Admin#2024!',
        role: 'super-admin',
    },
    {
        name: 'Hotdog Boss',
        email: 'boss@hotdog.uz',
        password: 'Boss#2024!',
        role: 'boss',
    },
    {
        name: 'Zohid Hodim',
        email: 'zohid@hotdog.uz',
        password: 'Staff#2024!',
        role: 'employee',
    },
];

const DEFAULT_MENU = [
    {
        name: 'Classic Hot Dog',
        description: "Klassik hot-dog, go'shtli sosiska va maxsus sous bilan",
        price: 15000,
        category: 'classic',
        imageUrl: 'https://images.unsplash.com/photo-1541214113241-21578d2d9b62?auto=format&fit=crop&q=80&w=800',
        available: true,
    },
    {
        name: 'Cheese Hot Dog',
        description: 'Eritilgan pishloq va xonaki sous bilan boyitilgan hot-dog',
        price: 18000,
        category: 'classic',
        imageUrl: 'https://images.unsplash.com/photo-1612392062631-94dd858cba88?auto=format&fit=crop&q=80&w=800',
        available: true,
    },
    {
        name: 'Premium Deluxe',
        description: "Premium darajadagi hot-dog, eng sara masalliqlar to'plami",
        price: 25000,
        category: 'premium',
        imageUrl: 'https://images.unsplash.com/photo-1599599810694-b5b37304c041?auto=format&fit=crop&q=80&w=800',
        available: true,
    },
    {
        name: 'Combo Meal',
        description: "Hot-dog + Kartoshka fri + Ichimlik (To'liq to'plam)",
        price: 30000,
        category: 'combo',
        imageUrl: 'https://images.unsplash.com/photo-1513185158878-8d8c1827053e?auto=format&fit=crop&q=80&w=800',
        available: true,
    },
    {
        name: 'Coca Cola',
        description: 'Muzdek va tetiklashtiruvchi Coca-Cola 0.5L',
        price: 5000,
        category: 'drinks',
        imageUrl: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&q=80&w=800',
        available: true,
    },
];

async function seedUser(userData) {
    const { name, email, password, role } = userData;

    try {
        // Firebase Auth'da user yaratish
        let userRecord;
        try {
            userRecord = await adminAuth.getUserByEmail(email);
            console.log(`ℹ️  User already exists in Auth: ${email}`);
        } catch {
            userRecord = await adminAuth.createUser({ email, password, displayName: name });
            console.log(`✅ Auth user created: ${email}`);
        }

        // Firestore'da profil yaratish/yangilash
        await db.collection('users').doc(userRecord.uid).set(
            { name, email, role, favoriteItems: [], createdAt: new Date() },
            { merge: true }
        );
        console.log(`✅ Firestore profile set: ${email} [${role}]`);

    } catch (error) {
        console.error(`❌ Error seeding ${email}:`, error.message);
    }
}

async function seedMenu() {
    const menuRef = db.collection('menuItems');
    const existing = await menuRef.get();

    if (!existing.empty) {
        console.log(`ℹ️  Menu items already exist (${existing.size} items). Skipping.`);
        return;
    }

    for (const item of DEFAULT_MENU) {
        await menuRef.add({ ...item, createdAt: new Date() });
        console.log(`✅ Menu item added: ${item.name}`);
    }
}

async function main() {
    console.log('\n🌭 Hotdog Tony — Firebase Seed Script\n');
    console.log('='.repeat(40));

    console.log('\n📋 Staff foydalanuvchilarni yaratish...\n');
    for (const user of STAFF_USERS) {
        await seedUser(user);
    }

    console.log('\n🍔 Default menu itemlarni yaratish...\n');
    await seedMenu();

    console.log('\n' + '='.repeat(40));
    console.log('✅ Seed muvaffaqiyatli yakunlandi!\n');
    console.log('🔑 Login ma\'lumotlari:');
    STAFF_USERS.forEach(u => {
        console.log(`   ${u.role.padEnd(12)} | ${u.email.padEnd(22)} | ${u.password}`);
    });
    console.log('\n⚠️  Parollarni darhol o\'zgartiring!\n');

    process.exit(0);
}

main().catch(err => {
    console.error('❌ Seed xatosi:', err);
    process.exit(1);
});
