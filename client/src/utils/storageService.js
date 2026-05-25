/**
 * Image Upload Service — ImgBB (bepul, Firebase Storage shart emas)
 * ImgBB API: https://api.imgbb.com/
 * API Key olish: https://imgbb.com/signup → API → Add API key
 */

const IMGBB_API_KEY = process.env.REACT_APP_IMGBB_API_KEY;

/**
 * Rasmni ImgBB ga yuklash
 * @param {File} file - Rasm fayl
 * @param {string} folder - (unused, ImgBB da papka yo'q)
 * @returns {Promise<string>} - Download URL
 */
export const uploadImage = async (file, folder = 'menu') => {
    if (!IMGBB_API_KEY) {
        throw new Error('REACT_APP_IMGBB_API_KEY .env faylida yo\'q!');
    }

    // File → Base64
    const base64 = await fileToBase64(file);
    // Base64 prefiksini olib tashlash: "data:image/jpeg;base64,..."
    const base64Data = base64.split(',')[1];

    const formData = new FormData();
    formData.append('image', base64Data);
    formData.append('name', `${folder}_${Date.now()}`);

    const response = await fetch(`https://api.imgbb.com/1/upload?key=${IMGBB_API_KEY}`, {
        method: 'POST',
        body: formData,
    });

    if (!response.ok) {
        throw new Error(`ImgBB xatosi: ${response.statusText}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error('Rasm yuklashda xatolik: ' + (data.error?.message || 'Noma\'lum xato'));
    }

    // display_url — to'g'ridan-to'g'ri rasm URL
    return data.data.display_url;
};

/**
 * Rasmni o'chirish — ImgBB bepul API da delete yo'q
 * (Rasm URL dan Firestore'da olib tashlanadi)
 */
export const deleteImage = async (imageUrl) => {
    // ImgBB free API delete ni qo'llab-quvvatlamaydi
    // URL Firestore dan o'chiriladi, rasm ImgBB serverida qoladi
    console.info('deleteImage: ImgBB da rasm o\'chirish API qo\'llab-quvvatlanmaydi:', imageUrl);
};

// ─── HELPER ──────────────────────────────────────────────────────────────────

function fileToBase64(file) {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.readAsDataURL(file);
        reader.onload = () => resolve(reader.result);
        reader.onerror = (error) => reject(error);
    });
}
