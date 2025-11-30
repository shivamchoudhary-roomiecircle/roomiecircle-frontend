import { useState, useEffect } from "react";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { Sparkles, Send, ThumbsUp, MapPin, Users, Home } from "lucide-react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useTheme } from "next-themes";
import SEO from "@/components/SEO";

const ComingSoon = () => {
    const navigate = useNavigate();
    const { theme } = useTheme();
    const [mounted, setMounted] = useState(false);
    const [featureInput, setFeatureInput] = useState("");
    const [features, setFeatures] = useState([
        { id: 1, title: "Lifestyle Compatibility Quiz", desc: "Detailed quiz to match habits.", votes: 125, voted: false },
        { id: 2, title: "Verified Profiles", desc: "ID verification for safety.", votes: 89, voted: false },
        { id: 3, title: "Video Introductions", desc: "Short video bios for users.", votes: 56, voted: false },
    ]);
    const [isModalOpen, setIsModalOpen] = useState(false);

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleUpvote = (id: number) => {
        setFeatures(features.map(f => {
            if (f.id === id) {
                return {
                    ...f,
                    votes: f.voted ? f.votes - 1 : f.votes + 1,
                    voted: !f.voted
                };
            }
            return f;
        }));
    };

    const handleSubmitFeature = () => {
        if (featureInput.trim()) {
            // In a real app, this would send to backend
            alert(`Thanks for suggesting: "${featureInput}"! We'll look into it.`);
            setFeatureInput("");
            setIsModalOpen(false);
        }
    };

    // Prevent hydration mismatch
    if (!mounted) return null;

    const bgImage = theme === 'dark' ? '/coming-soon-bg.png' : '/coming-soon-bg-day.png';

    return (
        <div className="min-h-screen flex flex-col relative overflow-hidden">
            <SEO
                title="Roommates - Coming Soon"
                description="Our roommate matching feature is coming soon. Find compatible roommates based on lifestyle habits."
                keywords={['roommates', 'coming soon', 'match', 'lifestyle']}
            />
            <div
                className="absolute inset-0 z-0 transition-all duration-1000 ease-in-out"
                style={{
                    backgroundImage: `url('${bgImage}')`,
                    backgroundSize: 'cover',
                    backgroundPosition: 'center bottom',
                }}
            />
            <div className="absolute inset-0 bg-black/50 z-0 backdrop-blur-[2px]" />
            <div className="relative z-10 flex flex-col min-h-screen">
                <Navbar />

                <main className="flex-1 container mx-auto px-4 py-12 flex flex-col lg:flex-row items-center justify-center gap-12 lg:gap-20 text-white">

                    {/* Left Section - Profile Deck */}
                    <div className="flex-1 w-full max-w-sm flex flex-col items-center lg:items-end order-2 lg:order-1">
                        <div className="relative w-64 h-80">
                            {/* Card 3 (Bottom) */}
                            <Card className="absolute top-4 left-4 w-full h-full bg-background border-border shadow-sm rotate-6 opacity-60 scale-95 z-0">
                                <CardContent className="p-0 h-full">
                                    <div className="h-3/5 bg-muted rounded-t-lg overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1517841905240-472988babdf9?w=400&auto=format&fit=crop&q=60" alt="Emily" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold">Emily, 23</h3>
                                        <p className="text-sm text-muted-foreground">📍 Manhattan, NY</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 2 (Middle) */}
                            <Card className="absolute top-2 left-2 w-full h-full bg-background border-border shadow-md -rotate-3 opacity-80 scale-[0.98] z-10">
                                <CardContent className="p-0 h-full">
                                    <div className="h-3/5 bg-muted rounded-t-lg overflow-hidden">
                                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=400&auto=format&fit=crop&q=60" alt="Mike" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-semibold">Mike, 26</h3>
                                        <p className="text-sm text-muted-foreground">📍 Brooklyn, NY</p>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Card 1 (Top) */}
                            <Card className="absolute top-0 left-0 w-full h-full bg-background border-border shadow-xl rotate-0 z-20 transition-transform hover:-translate-y-2 duration-300">
                                <CardContent className="p-0 h-full flex flex-col">
                                    <div className="h-3/5 bg-muted rounded-t-lg overflow-hidden relative">
                                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=400&auto=format&fit=crop&q=60" alt="Sarah" className="w-full h-full object-cover" />
                                    </div>
                                    <div className="p-4 flex-1">
                                        <h3 className="font-bold text-lg">Sneha, 24</h3>
                                        <p className="text-sm text-muted-foreground mb-2">📍 Mumbai, Maharashtra</p>
                                        <div className="flex flex-wrap gap-1">
                                            <Badge variant="secondary" className="text-xs font-normal">🎨 Designer</Badge>
                                            <Badge variant="secondary" className="text-xs font-normal">🐕 Dog Lover</Badge>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="mt-8 text-center lg:text-right w-64">
                            <p className="text-primary font-medium">Find your perfect match</p>
                            <p className="text-xs text-muted-foreground">Smart matching algorithm</p>
                        </div>
                    </div>

                    {/* Center Section - Coming Soon */}
                    <div className="flex-1 text-center space-y-12 order-1 lg:order-2">
                        <div className="inline-block animate-bounce">
                            <span className="text-6xl">🚀</span>
                        </div>

                        <div className="space-y-10">
                            <h1 className="text-4xl md:text-5xl font-bold tracking-tight">
                                <span className="text-primary">few days</span> <span className="text-orange-500">to go</span>
                            </h1>

                            <div className="max-w-md mx-auto space-y-6 text-left bg-card/50 backdrop-blur-sm p-8 rounded-2xl border border-border/50 shadow-sm">

                                <div className="space-y-6">
                                    <div className="flex gap-3 items-start group">
                                        <div className="bg-primary/10 p-2.5 rounded-xl mt-0.5 group-hover:bg-primary/20 transition-colors">
                                            <MapPin className="w-5 h-5 text-primary" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Location-Based Matching</h4>
                                            <p className="text-sm text-muted-foreground leading-snug">Connect with others actively looking in the same neighborhoods as you.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start group">
                                        <div className="bg-orange-500/10 p-2.5 rounded-xl mt-0.5 group-hover:bg-orange-500/20 transition-colors">
                                            <Users className="w-5 h-5 text-orange-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Team Up & Hunt</h4>
                                            <p className="text-sm text-muted-foreground leading-snug">Need a search partner? Find someone to look for flats with you.</p>
                                        </div>
                                    </div>

                                    <div className="flex gap-3 items-start group">
                                        <div className="bg-blue-500/10 p-2.5 rounded-xl mt-0.5 group-hover:bg-blue-500/20 transition-colors">
                                            <Home className="w-5 h-5 text-blue-500" />
                                        </div>
                                        <div>
                                            <h4 className="font-medium">Have a Flat?</h4>
                                            <p className="text-sm text-muted-foreground leading-snug">Already have a place? Find the perfect roommate to fill your empty room.</p>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => navigate('/')}
                            size="lg"
                            className="rounded-full px-8 bg-primary hover:bg-primary/90"
                        >
                            Back to Home
                        </Button>
                    </div>

                    {/* Right Section - Feedback */}
                    <div className="flex-1 w-full max-w-sm flex flex-col items-center lg:items-start order-3">
                        <div className="relative group w-full max-w-[300px]">
                            {/* Glow effect */}
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-primary to-orange-500 rounded-2xl blur opacity-20 group-hover:opacity-40 transition duration-1000 group-hover:duration-200" />

                            <Card className="relative w-full border-0 bg-card/95 backdrop-blur shadow-xl">
                                <CardContent className="p-8 text-center space-y-6">
                                    <div className="space-y-2">
                                        <h3 className="font-bold text-xl">Help us build what you need!</h3>
                                        <p className="text-sm text-muted-foreground">
                                            Have a brilliant idea? We'd love to hear it.
                                        </p>
                                    </div>
                                    <Dialog open={isModalOpen} onOpenChange={setIsModalOpen}>
                                        <DialogTrigger asChild>
                                            <Button className="w-full h-12 gap-2 bg-gradient-to-r from-primary to-orange-500 hover:from-primary/90 hover:to-orange-600 text-white shadow-md hover:shadow-lg transition-all duration-300 transform hover:-translate-y-0.5 rounded-xl font-semibold">
                                                <Sparkles className="w-5 h-5 text-yellow-200" />
                                                Request Feature
                                            </Button>
                                        </DialogTrigger>
                                        <DialogContent className="sm:max-w-md">
                                            <DialogHeader>
                                                <DialogTitle className="text-xl">Shape RoomieCircle</DialogTitle>
                                                <DialogDescription>
                                                    Vote for the features you want to see first!
                                                </DialogDescription>
                                            </DialogHeader>

                                            <div className="space-y-4 py-4">
                                                {features.map((feature) => (
                                                    <div key={feature.id} className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-accent/50 transition-colors">
                                                        <div className="space-y-1">
                                                            <p className="font-medium text-sm">{feature.title}</p>
                                                            <p className="text-xs text-muted-foreground">{feature.desc}</p>
                                                        </div>
                                                        <Button
                                                            variant={feature.voted ? "default" : "outline"}
                                                            size="sm"
                                                            className={`gap-1.5 h-8 ${feature.voted ? 'bg-primary text-primary-foreground' : ''}`}
                                                            onClick={() => handleUpvote(feature.id)}
                                                        >
                                                            <ThumbsUp className="w-3 h-3" />
                                                            <span className="text-xs">{feature.votes}</span>
                                                        </Button>
                                                    </div>
                                                ))}
                                            </div>

                                            <DialogFooter className="flex-col sm:flex-col gap-2">
                                                <div className="flex gap-2 w-full">
                                                    <Input
                                                        placeholder="Suggest a new feature..."
                                                        value={featureInput}
                                                        onChange={(e) => setFeatureInput(e.target.value)}
                                                        className="flex-1"
                                                    />
                                                    <Button onClick={handleSubmitFeature} size="icon">
                                                        <Send className="w-4 h-4" />
                                                    </Button>
                                                </div>
                                            </DialogFooter>
                                        </DialogContent>
                                    </Dialog>
                                </CardContent>
                            </Card>
                        </div>
                    </div>

                </main>

                <div className="bg-background">
                    <Footer className="border-t-0 mt-0" />
                </div>
            </div>
        </div>
    );
};

export default ComingSoon;
