import {
    collection,
    doc,
    addDoc,
    getDoc,
    getDocs,
    updateDoc,
    deleteDoc,
    query,
    where,
    orderBy,
    limit,
    onSnapshot,
    increment,
    serverTimestamp,
    setDoc,
} from 'firebase/firestore';
import { db } from './firebase';
import { v4 as uuidv4 } from 'uuid';

// ─── MENU ────────────────────────────────────────────────────────────────────

export const getMenuItems = async () => {
    const q = query(collection(db, 'menuItems'), orderBy('createdAt', 'asc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const subscribeMenuItems = (callback) => {
    const q = query(collection(db, 'menuItems'), orderBy('createdAt', 'asc'));
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

export const addMenuItem = async (data) => {
    return await addDoc(collection(db, 'menuItems'), {
        ...data,
        createdAt: serverTimestamp(),
    });
};

export const updateMenuItem = async (id, data) => {
    await updateDoc(doc(db, 'menuItems', id), data);
};

export const deleteMenuItem = async (id) => {
    await deleteDoc(doc(db, 'menuItems', id));
};

// ─── ORDERS ──────────────────────────────────────────────────────────────────

export const createOrder = async ({ customerName, customerEmail, customerId, items }) => {
    // 1. Kunlik raqam (atomic increment)
    const today = new Date().toISOString().split('T')[0];
    const counterRef = doc(db, 'counters', today);
    const counterSnap = await getDoc(counterRef);

    let dailyNumber;
    if (!counterSnap.exists()) {
        await setDoc(counterRef, { count: 1 });
        dailyNumber = 1;
    } else {
        await updateDoc(counterRef, { count: increment(1) });
        dailyNumber = counterSnap.data().count + 1;
    }

    // 2. Narxlarni hisoblash
    const totalPrice = items.reduce((sum, item) => sum + item.price * item.quantity, 0);

    // 3. QR kod
    const qrCode = `HDS-${uuidv4()}`;

    // 4. Buyurtma yaratish
    const orderData = {
        customerName,
        customerEmail: customerEmail || null,
        customerId: customerId || null,
        items,
        totalPrice,
        dailyNumber,
        qrCode,
        status: 'pending',
        createdAt: serverTimestamp(),
        confirmedAt: null,
        readyAt: null,
        completedAt: null,
    };

    const orderRef = await addDoc(collection(db, 'orders'), orderData);
    return { id: orderRef.id, ...orderData, qrCode };
};

export const getOrder = async (id) => {
    const snap = await getDoc(doc(db, 'orders', id));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
};

export const subscribeOrder = (id, callback) => {
    return onSnapshot(doc(db, 'orders', id), snap => {
        if (snap.exists()) callback({ id: snap.id, ...snap.data() });
    });
};

export const getOrderByQR = async (qrCode) => {
    const q = query(collection(db, 'orders'), where('qrCode', '==', qrCode));
    const snap = await getDocs(q);
    if (snap.empty) return null;
    const d = snap.docs[0];
    return { id: d.id, ...d.data() };
};

export const updateOrderStatus = async (id, status) => {
    const updates = { status };
    if (status === 'preparing') updates.confirmedAt = serverTimestamp();
    if (status === 'ready')     updates.readyAt = serverTimestamp();
    if (status === 'completed') updates.completedAt = serverTimestamp();
    await updateDoc(doc(db, 'orders', id), updates);
};

export const deleteOrder = async (id) => {
    await deleteDoc(doc(db, 'orders', id));
};

// Subscribe: Hodim paneli uchun (pending + preparing)
export const subscribeEmployeeOrders = (callback) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = query(
        collection(db, 'orders'),
        where('status', 'in', ['pending', 'preparing', 'ready']),
        orderBy('createdAt', 'desc'),
        limit(50)
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

// Subscribe: Display screen uchun
export const subscribeDisplayOrders = (callback) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const q = query(
        collection(db, 'orders'),
        where('status', 'in', ['preparing', 'ready']),
        orderBy('createdAt', 'desc'),
        limit(30)
    );
    return onSnapshot(q, snap => {
        const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));
        callback({
            preparing: orders.filter(o => o.status === 'preparing'),
            ready: orders.filter(o => o.status === 'ready'),
        });
    });
};

// Subscribe: Mijoz o'z buyurtmalarini
export const subscribeCustomerOrders = (email, callback) => {
    const q = query(
        collection(db, 'orders'),
        where('customerEmail', '==', email),
        orderBy('createdAt', 'desc'),
        limit(20)
    );
    return onSnapshot(q, snap => {
        callback(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    });
};

// Boss uchun barcha buyurtmalar (bir martalik)
export const getAllOrders = async ({ status, limitCount = 100 } = {}) => {
    let q;
    if (status) {
        const statuses = status.split(',').map(s => s.trim());
        q = query(
            collection(db, 'orders'),
            where('status', 'in', statuses),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
    } else {
        q = query(
            collection(db, 'orders'),
            orderBy('createdAt', 'desc'),
            limit(limitCount)
        );
    }
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── USERS ───────────────────────────────────────────────────────────────────

export const getUserProfile = async (uid) => {
    const snap = await getDoc(doc(db, 'users', uid));
    if (!snap.exists()) return null;
    return { id: snap.id, ...snap.data() };
};

export const createUserProfile = async (uid, data) => {
    await setDoc(doc(db, 'users', uid), {
        ...data,
        createdAt: serverTimestamp(),
    });
};

export const updateUserProfile = async (uid, data) => {
    await updateDoc(doc(db, 'users', uid), data);
};

export const getAllUsers = async () => {
    const snap = await getDocs(collection(db, 'users'));
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const toggleFavorite = async (uid, menuItemId) => {
    const userRef = doc(db, 'users', uid);
    const userSnap = await getDoc(userRef);
    if (!userSnap.exists()) return;

    const favorites = userSnap.data().favoriteItems || [];
    const newFavorites = favorites.includes(menuItemId)
        ? favorites.filter(id => id !== menuItemId)
        : [...favorites, menuItemId];

    await updateDoc(userRef, { favoriteItems: newFavorites });
    return newFavorites;
};

// ─── FEEDBACK ────────────────────────────────────────────────────────────────

export const submitFeedback = async (data) => {
    const ref = await addDoc(collection(db, 'feedback'), {
        ...data,
        createdAt: serverTimestamp(),
    });
    // Buyurtmaga feedback ID bog'lash
    await updateDoc(doc(db, 'orders', data.orderId), { feedbackId: ref.id });
    return ref.id;
};

export const getAllFeedback = async () => {
    const q = query(collection(db, 'feedback'), orderBy('createdAt', 'desc'));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

// ─── REPORTS ─────────────────────────────────────────────────────────────────

export const getStats = async (period = 'daily') => {
    const now = new Date();
    let startDate = new Date();

    if (period === 'daily') startDate.setHours(0, 0, 0, 0);
    else if (period === 'weekly') startDate.setDate(now.getDate() - 7);
    else if (period === 'monthly') startDate.setMonth(now.getMonth() - 1);

    const q = query(
        collection(db, 'orders'),
        where('createdAt', '>=', startDate),
        orderBy('createdAt', 'desc')
    );
    const snap = await getDocs(q);
    const orders = snap.docs.map(d => ({ id: d.id, ...d.data() }));

    const totalRevenue = orders.reduce((sum, o) => sum + (o.totalPrice || 0), 0);
    const totalOrders = orders.length;
    const completedOrders = orders.filter(o => o.status === 'completed').length;

    return { totalRevenue, totalOrders, completedOrders, orders };
};
