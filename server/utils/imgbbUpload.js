const axios = require('axios');
const FormData = require('form-data');

/**
 * Upload image to ImgBB
 * @param {String} base64Image - Base64 encoded image
 * @returns {Object} - Image URL and delete URL
 */
const uploadToImgBB = async (base64Image) => {
    try {
        // Remove data:image/...;base64, prefix if present
        const base64Data = base64Image.replace(/^data:image\/\w+;base64,/, '');

        const formData = new FormData();
        formData.append('image', base64Data);

        const response = await axios.post(
            `https://api.imgbb.com/1/upload?key=${process.env.IMGBB_API_KEY}`,
            formData,
            {
                headers: formData.getHeaders()
            }
        );

        if (response.data.success) {
            return {
                url: response.data.data.url,
                displayUrl: response.data.data.display_url,
                deleteUrl: response.data.data.delete_url,
                thumb: response.data.data.thumb.url
            };
        } else {
            throw new Error('ImgBB upload failed');
        }
    } catch (error) {
        console.error('ImgBB upload error:', error.response?.data || error.message);
        throw new Error('Failed to upload image');
    }
};

module.exports = { uploadToImgBB };
