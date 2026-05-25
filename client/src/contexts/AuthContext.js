import React, { createContext, useContext, useState, useEffect } from 'react';
import {
    onAuthStateChanged,
    signInWithPopup,
    signInWithEmailAndPassword,
    signOut,
    createUserWithEmailAndPassword,
} from 'firebase/auth';
import { auth, googleProvider } from '../utils/firebase';
import { getUserProfile, createUserProfile } from '../utils/firestore';

const AuthContext = createContext(null);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) throw new Error('useAuth must be used within AuthProvider');
    return context;
};

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
            if (firebaseUser) {
                try {
                    // Firestore'dan rol va profil ma'lumotlarini olish
                    let profile = await getUserProfile(firebaseUser.uid);

                    if (!profile) {
                        // Yangi Google user — customer sifatida yaratish
                        profile = {
                            name: firebaseUser.displayName || firebaseUser.email,
                            email: firebaseUser.email,
                            role: 'customer',
                            favoriteItems: [],
                        };
                        await createUserProfile(firebaseUser.uid, profile);
                    }

                    setUser({
                        uid: firebaseUser.uid,
                        email: firebaseUser.email,
                        name: profile.name,
                        role: profile.role,
                        favoriteItems: profile.favoriteItems || [],
                        photoURL: firebaseUser.photoURL,
                    });
                } catch (error) {
                    console.error('Profile load error:', error);
                    setUser(null);
                }
            } else {
                setUser(null);
            }
            setLoading(false);
        });

        return () => unsubscribe();
    }, []);

    // Mijoz: Google bilan kirish
    const loginWithGoogle = async () => {
        const result = await signInWithPopup(auth, googleProvider);
        return result.user;
    };

    // Xodim/Boss/Admin: Email + parol bilan kirish
    const loginWithEmail = async (email, password) => {
        const result = await signInWithEmailAndPassword(auth, email, password);
        return result.user;
    };

    // Yangi mijoz: Email + parol bilan ro'yxatdan o'tish
    const registerWithEmail = async (name, email, password) => {
        const result = await createUserWithEmailAndPassword(auth, email, password);
        await createUserProfile(result.user.uid, {
            name,
            email,
            role: 'customer',
            favoriteItems: [],
        });
        return result.user;
    };

    const logout = async () => {
        await signOut(auth);
        setUser(null);
    };

    const updateUser = (data) => {
        setUser(prev => ({ ...prev, ...data }));
    };

    const value = {
        user,
        loading,
        loginWithGoogle,
        loginWithEmail,
        registerWithEmail,
        logout,
        updateUser,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
