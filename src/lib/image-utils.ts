/**
 * Converts a file to JPEG format using HTML Canvas.
 * Supports PNG, WebP, and other browser-supported formats.
 * 
 * Note: HEIC support depends on browser native support. 
 * For full HEIC support across all browsers, a library like 'heic2any' is recommended.
 */
export const convertFileToJpeg = async (file: File, quality = 0.8): Promise<File> => {
    // If already JPEG, return as is
    if (file.type === 'image/jpeg' || file.type === 'image/jpg') {
        return file;
    }

    return new Promise((resolve, reject) => {
        const img = new Image();
        const url = URL.createObjectURL(file);

        img.onload = () => {
            URL.revokeObjectURL(url);
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            const ctx = canvas.getContext('2d');
            if (!ctx) {
                reject(new Error('Failed to get canvas context'));
                return;
            }

            // Draw image on white background (for transparent PNGs)
            ctx.fillStyle = '#FFFFFF';
            ctx.fillRect(0, 0, canvas.width, canvas.height);
            ctx.drawImage(img, 0, 0);

            canvas.toBlob(
                (blob) => {
                    if (blob) {
                        // Create new File object
                        const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, "") + ".jpg", {
                            type: 'image/jpeg',
                            lastModified: Date.now(),
                        });
                        resolve(newFile);
                    } else {
                        reject(new Error('Canvas to Blob conversion failed'));
                    }
                },
                'image/jpeg',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(url);
            reject(new Error('Failed to load image for conversion. Format might not be supported.'));
        };

        img.src = url;
    });
};
