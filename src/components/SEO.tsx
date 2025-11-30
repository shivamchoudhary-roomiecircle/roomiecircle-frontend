import { Helmet } from 'react-helmet-async';

interface SEOProps {
    title: string;
    description: string;
    canonical?: string;
    image?: string;
    type?: 'website' | 'article';
    keywords?: string[];
}

const SEO = ({
    title,
    description,
    canonical,
    image = "https://roomiecircle.com/og-image.png", // Default image
    type = 'website',
    keywords = []
}: SEOProps) => {
    const siteTitle = "RoomieCircle";
    const fullTitle = title === siteTitle ? title : `${title} | ${siteTitle}`;
    const baseUrl = "https://roomiecircle.com";
    const fullCanonical = canonical ? (canonical.startsWith('http') ? canonical : `${baseUrl}${canonical}`) : baseUrl;
    const fullImage = image.startsWith('http') ? image : `${baseUrl}${image}`;

    return (
        <Helmet>
            {/* Standard metadata */}
            <title>{fullTitle}</title>
            <meta name="description" content={description} />
            <meta name="keywords" content={keywords.join(', ')} />
            <link rel="canonical" href={fullCanonical} />

            {/* Open Graph / Facebook */}
            <meta property="og:type" content={type} />
            <meta property="og:title" content={fullTitle} />
            <meta property="og:description" content={description} />
            <meta property="og:image" content={fullImage} />
            <meta property="og:url" content={fullCanonical} />
            <meta property="og:site_name" content={siteTitle} />

            {/* Twitter */}
            <meta name="twitter:card" content="summary_large_image" />
            <meta name="twitter:title" content={fullTitle} />
            <meta name="twitter:description" content={description} />
            <meta name="twitter:image" content={fullImage} />

            {/* Additional SEO tags */}
            <meta name="robots" content="index, follow" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        </Helmet>
    );
};

export default SEO;
