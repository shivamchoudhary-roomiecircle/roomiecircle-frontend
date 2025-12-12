import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";

const PrivacyPolicy = () => {
    return (
        <div className="min-h-screen flex flex-col">
            <SEO
                title="Privacy Policy | Roomiecircle"
                description="Learn how Roomiecircle collects, uses, and protects your personal information."
                keywords={['privacy policy', 'data protection', 'roomiecircle', 'security']}
            />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <h1 className="text-3xl font-bold mb-6">Privacy Policy</h1>
                <div className="prose prose-sm md:prose-base dark:prose-invert max-w-none space-y-4">
                    <p>Last updated: {new Date().toLocaleDateString()}</p>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">1. Information We Collect</h2>
                        <p>
                            We collect information you provide directly to us, such as when you create an account, update your profile, list a room, or communicate with other users.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">2. How We Use Information</h2>
                        <p>
                            We use the information we collect to operate, maintain, and improve our services, facilitate connections between users, and enhance the safety of our community.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">3. Information Sharing</h2>
                        <p>
                            We do not sell your personal information. We may share information with other users as part of the service (e.g., your public profile) or with service providers who assist us.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">4. Data Security</h2>
                        <p>
                            We implement appropriate technical and organizational measures to protect specific personal information. However, please note that no system is completely secure.
                        </p>
                    </section>

                    <section>
                        <h2 className="text-xl font-semibold mb-2">5. Your Rights</h2>
                        <p>
                            You may access, correct, or delete your personal information at any time through your account settings or by contacting us.
                        </p>
                    </section>
                </div>
            </main>
            <Footer />
        </div>
    );
};

export default PrivacyPolicy;
