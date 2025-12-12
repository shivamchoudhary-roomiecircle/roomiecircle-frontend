import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const TermsOfService = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <SEO
                title="Terms of Service | Roomiecircle"
                description="Read our Terms of Service to understand your rights and responsibilities when using Roomiecircle."
                keywords={['terms of service', 'legal', 'roomiecircle', 'user agreement']}
            />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Terms of Service</h1>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-4">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">1. Acceptance of Terms</h2>
                        <p>
                            By accessing and using Roomiecircle, you accept and agree to be bound by the terms and provision of this agreement.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. User Accounts</h2>
                        <p>
                            To use certain features of the service, you must register for an account. You agree to provide accurate usage information and keep it updated.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. Content</h2>
                        <p>
                            You retain all rights to any content you submit, post or display on or through the service. By submitting, posting or displaying content on or through the service, you grant us a worldwide, non-exclusive, royalty-free license.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">4. Prohibited Uses</h2>
                        <p>
                            You agree not to use the service for any unlawful purpose or in any way that interrupts, damages, impairs or renders the service less efficient.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">5. Termination</h2>
                        <p>
                            We may terminate or suspend access to our service immediately, without prior notice or liability, for any reason whatsoever, including without limitation if you breach the Terms.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default TermsOfService;
