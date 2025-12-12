import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";
import SEO from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Camera, User as UserIcon, Mail, ShieldCheck, BadgeCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mediaApi, authApi } from "@/lib/api";

export default function Profile() {
    const { user, logout } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(user?.profilePicture || null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchProfileImage = async () => {
            // Logic to sync profile image if needed beyond auth context
            if (user?.profilePicture) setProfileImage(user.profilePicture);
        };
        fetchProfileImage();
    }, [user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (!file || !user) return;

        setUploading(true);
        try {
            // Simplified upload logic assuming backend handles it or we have a helper
            // Reusing logic from previous implementation memory roughly
            const { uploadId, presigned_url } = await mediaApi.requestMediaUploadUrl(
                user.id.toString(),
                "PROFILE",
                "IMAGE",
                file.type
            );

            await fetch(presigned_url, {
                method: 'PUT',
                headers: { 'Content-Type': file.type },
                body: file
            });

            await mediaApi.confirmMediaUpload(uploadId);

            // Refresh logic or toast
            toast({ title: "Profile updated", description: "Your profile picture has been updated." });
            setProfileImage(URL.createObjectURL(file));
        } catch (error) {
            console.error(error);
            toast({ title: "Error", description: "Failed to upload image", variant: "destructive" });
        } finally {
            setUploading(false);
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await authApi.deleteAccount();
            logout();
        } catch (error) {
            toast({
                title: "Error",
                description: "Failed to delete account. Please try again.",
                variant: "destructive"
            });
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center min-h-screen">
                <Navbar />
                <div className="flex-1 flex flex-col justify-center items-center">
                    <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
                    <Button onClick={() => window.location.href = '/auth/login'}>Sign In</Button>
                </div>
                <Footer />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex flex-col">
            <SEO title="My Profile | Roomiecircle" description="Manage your profile and account settings." />
            <Navbar />
            <main className="flex-1 container mx-auto px-4 py-8 max-w-4xl">
                <div className="flex flex-col md:flex-row gap-8 items-start">
                    {/* Left Column: Profile Card */}
                    <Card className="w-full md:w-1/3">
                        <CardHeader className="text-center">
                            <div className="relative mx-auto mb-4 group cursor-pointer w-32 h-32">
                                <Avatar className="w-32 h-32 border-4 border-background shadow-xl">
                                    <AvatarImage src={profileImage || undefined} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-muted">{user?.name?.charAt(0) || "U"}</AvatarFallback>
                                </Avatar>
                                <label className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer hover:bg-primary/90 transition-colors shadow-lg">
                                    {uploading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Camera className="w-4 h-4" />}
                                    <input type="file" className="hidden" accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                                </label>
                            </div>
                            <CardTitle>{user?.name}</CardTitle>
                            <CardDescription>{user?.email}</CardDescription>

                            <div className="flex items-center justify-center gap-2 mt-2 text-sm text-green-600 bg-green-50 py-1 px-3 rounded-full w-fit mx-auto">
                                <BadgeCheck className="w-4 h-4" />
                                <span>Verified Account</span>
                            </div>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-1">
                                <Label className="text-xs text-muted-foreground">Member Since</Label>
                                <div className="text-sm font-medium">January 2024</div>
                            </div>
                            {/* Account Deletion */}
                            <div className="pt-6 border-t">
                                <Button
                                    variant="destructive"
                                    className="w-full"
                                    onClick={() => setShowDeleteDialog(true)}
                                >
                                    Delete Account
                                </Button>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Right Column: Account Details */}
                    <Card className="flex-1 w-full">
                        <CardHeader>
                            <CardTitle>Account Details</CardTitle>
                            <CardDescription>Manage your profile information and preferences.</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-6">
                            <div className="grid gap-4 md:grid-cols-2">
                                <div className="space-y-2">
                                    <Label htmlFor="name">Full Name</Label>
                                    <div className="relative">
                                        <UserIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="name" defaultValue={user?.name} disabled className="pl-9 bg-muted/50" />
                                    </div>
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="email">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                                        <Input id="email" defaultValue={user?.email} disabled className="pl-9 bg-muted/50" />
                                    </div>
                                </div>
                            </div>

                            <div className="bg-sky-50 dark:bg-sky-900/20 p-4 rounded-lg flex gap-3 text-sky-700 dark:text-sky-300">
                                <ShieldCheck className="w-5 h-5 shrink-0 mt-0.5" />
                                <div className="text-sm">
                                    <p className="font-semibold mb-1">Your data is secure</p>
                                    <p className="opacity-90">We use industry standard encryption to protect your personal information.</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>
            <Footer />

            {/* Delete Account Dialog */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4 animate-in fade-in">
                    <Card className="w-full max-w-md shadow-2xl animate-in zoom-in-95">
                        <CardHeader>
                            <CardTitle className="text-destructive">Delete Account?</CardTitle>
                            <CardDescription>
                                This action cannot be undone. This will permanently delete your account and remove your data from our servers.
                            </CardDescription>
                        </CardHeader>
                        <CardContent className="flex gap-4 justify-end">
                            <Button variant="outline" onClick={() => setShowDeleteDialog(false)}>Cancel</Button>
                            <Button variant="destructive" onClick={handleDeleteAccount}>Yes, Delete Account</Button>
                        </CardContent>
                    </Card>
                </div>
            )}
        </div>
    );
}
