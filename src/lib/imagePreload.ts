import { getImageUrl } from './utils';

/**
 * Preloads a single image into browser cache
 * Uses the Image constructor for background loading
 */
export function preloadImage(url: string): Promise<void> {
    const imageUrl = getImageUrl(url);
    if (!imageUrl) return Promise.resolve();

    return new Promise((resolve) => {
        const img = new Image();
        img.onload = () => resolve();
        img.onerror = () => resolve(); // Don't reject, just resolve silently
        img.src = imageUrl;
    });
}

/**
 * Preloads multiple images in parallel
 * Useful for preloading all photos of a listing on hover
 */
export function preloadImages(urls: (string | undefined | null)[]): void {
    const validUrls = urls.filter((url): url is string => !!url);
    validUrls.forEach((url) => preloadImage(url));
}

/**
 * Preloads images using link preload (higher priority)
 * Best for critical images that need to load first
 */
export function preloadImageWithPriority(url: string): void {
    const imageUrl = getImageUrl(url);
    if (!imageUrl) return;

    // Check if already preloaded
    const existing = document.querySelector(`link[href="${imageUrl}"]`);
    if (existing) return;

    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = imageUrl;
    document.head.appendChild(link);
}
