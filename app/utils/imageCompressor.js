/**
 * Compress an image File using the Canvas API.
 * Returns a new File (JPEG) with reduced size.
 * 
 * @param {File} file - Original image file
 * @param {Object} options
 * @param {number} options.maxWidth  - Max width in pixels (default 1920)
 * @param {number} options.maxHeight - Max height in pixels (default 1920)
 * @param {number} options.quality   - JPEG quality 0–1 (default 0.82)
 * @param {number} options.maxSizeBytes - Target max byte size (default 2.5MB)
 * @returns {Promise<File>} Compressed file
 */
export async function compressImage(file, {
    maxWidth = 1920,
    maxHeight = 1920,
    quality = 0.82,
    maxSizeBytes = 2.5 * 1024 * 1024
} = {}) {
    // If file is already small enough, return as-is
    if (file.size <= maxSizeBytes) return file;

    return new Promise((resolve, reject) => {
        const img = new Image();
        const objectUrl = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(objectUrl);

            // Calculate new dimensions keeping aspect ratio
            let { width, height } = img;
            if (width > maxWidth || height > maxHeight) {
                const ratio = Math.min(maxWidth / width, maxHeight / height);
                width = Math.round(width * ratio);
                height = Math.round(height * ratio);
            }

            const canvas = document.createElement('canvas');
            canvas.width = width;
            canvas.height = height;

            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0, width, height);

            // Try compressing with decreasing quality until under maxSizeBytes
            const tryCompress = (q) => {
                canvas.toBlob(
                    (blob) => {
                        if (!blob) {
                            reject(new Error('Canvas toBlob failed'));
                            return;
                        }
                        if (blob.size > maxSizeBytes && q > 0.4) {
                            // Retry with lower quality
                            tryCompress(Math.round((q - 0.1) * 10) / 10);
                        } else {
                            const extension = file.name.split('.').pop().toLowerCase();
                            const outputName = file.name.replace(/\.[^.]+$/, '') + '_compressed.jpg';
                            const compressedFile = new File([blob], outputName, {
                                type: 'image/jpeg',
                                lastModified: Date.now()
                            });
                            resolve(compressedFile);
                        }
                    },
                    'image/jpeg',
                    q
                );
            };

            tryCompress(quality);
        };

        img.onerror = () => {
            URL.revokeObjectURL(objectUrl);
            // If we can't load the image, return original
            resolve(file);
        };

        img.src = objectUrl;
    });
}

/**
 * Compress multiple image files.
 * @param {File[]} files
 * @param {Object} options - Same as compressImage options
 * @returns {Promise<File[]>}
 */
export async function compressImages(files, options = {}) {
    return Promise.all(files.map(file => compressImage(file, options)));
}
