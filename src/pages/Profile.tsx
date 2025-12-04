import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Loader2, Upload, Camera, User as UserIcon, Mail, ShieldCheck, BadgeCheck } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { mediaApi, authApi } from "@/lib/api";
import { convertFileToJpeg } from "@/lib/image-utils";
import "./Profile.css";

export default function Profile() {
    const { user, logout, updateUser } = useAuth();
    const [uploading, setUploading] = useState(false);
    const [profileImage, setProfileImage] = useState<string | null>(user?.profilePicture || null);
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    useEffect(() => {
        const fetchProfileImage = async () => {
            if (user?.profilePicture) {
                setProfileImage(user.profilePicture);
            }

            if (user?.id) {
                try {
                    const mediaList = await mediaApi.fetchMediaForResource(user.id.toString(), 'IMAGE', 'PROFILE');
                    if (mediaList && mediaList.length > 0) {
                        // Use the most recent or highest priority image
                        setProfileImage(mediaList[0].url);
                    }
                } catch (error) {
                    console.error("Failed to fetch profile image", error);
                }
            }
        };
        fetchProfileImage();
    }, [user]);

    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        let file = e.target.files?.[0];
        if (!file || !user) return;

        // Allow more types initially, we will convert them
        const validTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/heic', 'image/heif'];
        // Note: 'image/heic' might not be detected correctly by all browsers, sometimes it's empty or different.

        // Basic type check, but we'll try to convert anyway if it's an image
        if (!file.type.startsWith('image/')) {
            toast({
                title: "Invalid file type",
                description: "Please upload an image file.",
                variant: "destructive",
            });
            return;
        }

        try {
            setUploading(true);

            // Convert to JPEG
            try {
                file = await convertFileToJpeg(file);
            } catch (conversionError) {
                console.error("Conversion failed:", conversionError);
                toast({
                    title: "Conversion Failed",
                    description: "Could not convert image. Please try a standard JPEG or PNG.",
                    variant: "destructive",
                });
                setUploading(false);
                return;
            }

            // 1. Get upload URL
            const { uploadId, presigned_url } = await mediaApi.requestMediaUploadUrl(
                user.id.toString(),
                "PROFILE",
                "IMAGE",
                file.type,
            );

            // 2. Upload to GCS
            const uploadResponse = await fetch(presigned_url, {
                method: 'PUT',
                headers: {
                    'Content-Type': file.type,
                },
                body: file,
            });

            if (!uploadResponse.ok) {
                throw new Error("Failed to upload image to storage");
            }

            // 3. Confirm upload
            const confirmResponse = await mediaApi.confirmMediaUpload(uploadId);

            if (confirmResponse && confirmResponse.url) {
                const newProfilePicUrl = confirmResponse.url;
                setProfileImage(newProfilePicUrl);
                updateUser({ profilePicture: newProfilePicUrl });
                toast({
                    title: "Success",
                    description: "Profile picture updated successfully!",
                });
            } else {
                throw new Error("Failed to confirm upload");
            }

        } catch (error: any) {
            console.error("Profile upload error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to update profile picture",
                variant: "destructive",
            });
        } finally {
            setUploading(false);
            // Reset input
            e.target.value = '';
        }
    };

    const handleDeleteAccount = async () => {
        try {
            await authApi.deleteAccount();
            toast({
                title: "Account Deleted",
                description: "Your account has been scheduled for deletion.",
            });
            setShowDeleteDialog(false);
            logout();
        } catch (error: any) {
            console.error("Delete account error:", error);
            toast({
                title: "Error",
                description: error.message || "Failed to delete account",
                variant: "destructive",
            });
        }
    };

    if (!user) {
        return (
            <div className="flex flex-col items-center justify-center p-8 text-center">
                <p className="text-muted-foreground mb-4">Please sign in to view your profile</p>
                <Button onClick={() => window.location.href = '/auth/login'}>Sign In</Button>
            </div>
        );
    }

    return (
        <div className="container mx-auto px-4 py-8 max-w-2xl">
            <h1 className="text-3xl font-bold mb-8">My Profile</h1>

            <div className="grid gap-6">
                {/* Profile Header Card */}
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col md:flex-row items-center gap-6">
                            <div className="relative group">
                                <Avatar className="h-32 w-32 border-4 border-background shadow-xl">
                                    <AvatarImage src={profileImage || ""} alt={user.name} className="object-cover" />
                                    <AvatarFallback className="text-4xl bg-primary/10 text-primary">
                                        {user.name.charAt(0).toUpperCase()}
                                    </AvatarFallback>
                                </Avatar>

                                <Label
                                    htmlFor="profile-upload"
                                    className="absolute bottom-0 right-0 p-2 bg-primary text-primary-foreground rounded-full cursor-pointer shadow-lg hover:bg-primary/90 transition-colors"
                                >
                                    {uploading ? (
                                        <Loader2 className="h-5 w-5 animate-spin" />
                                    ) : (
                                        <Camera className="h-5 w-5" />
                                    )}
                                    <input
                                        id="profile-upload"
                                        type="file"
                                        accept="image/jpeg,image/jpg,image/png,image/webp"
                                        className="hidden"
                                        onChange={handleImageUpload}
                                        disabled={uploading}
                                    />
                                </Label>
                            </div>

                            <div className="text-center md:text-left space-y-2 flex-1">
                                <h2 className="text-2xl font-bold">{user.name}</h2>
                                <div className="flex items-center justify-center md:justify-start gap-2 text-muted-foreground">
                                    <Mail className="h-4 w-4" />
                                    <span>{user.email}</span>
                                    {user.isVerified && (
                                        <BadgeCheck className="h-4 w-4 text-blue-500 fill-blue-500/10" />
                                    )}
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Details */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Details</CardTitle>
                        <CardDescription>Manage your account information</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="grid gap-2">
                            <Label className="text-muted-foreground">Full Name</Label>
                            <div className="flex items-center gap-3 py-2">
                                <UserIcon className="h-5 w-5 text-primary" />
                                <span className="text-lg font-medium">{user.name}</span>
                            </div>
                        </div>

                        <div className="grid gap-2">
                            <Label className="text-muted-foreground">Email Address</Label>
                            <div className="flex items-center gap-3 py-2">
                                <Mail className="h-5 w-5 text-primary" />
                                <span className="text-lg font-medium">{user.email}</span>
                            </div>
                        </div>

                        <div className="pt-4">
                            <Button variant="destructive" onClick={logout} className="w-full md:w-auto">
                                Sign Out
                            </Button>
                        </div>
                    </CardContent>
                </Card>

                {/* Account Deletion Section */}
                <Card className="border-destructive/20">
                    <CardHeader>
                        <CardTitle className="text-destructive">Leaving Roomiecircle?</CardTitle>
                        <CardDescription>We're sad to see you go, but you can delete your account here.</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                            <div className="space-y-1">
                                <h4 className="font-medium">Delete Account</h4>
                                <p className="text-sm text-muted-foreground">
                                    Permanently delete your account and all of your content.
                                </p>
                            </div>
                            <Button
                                variant="destructive"
                                onClick={() => setShowDeleteDialog(true)}
                            >
                                Delete Account
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Custom Delete Confirmation Popup */}
            {showDeleteDialog && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="delete-card">
                        <div className="delete-header">
                            <div className="delete-image">
                                <svg aria-hidden="true" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24" fill="none">
                                    <path d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" strokeLinejoin="round" strokeLinecap="round"></path>
                                </svg>
                            </div>
                            <div className="delete-content">
                                <span className="delete-title">Delete Account</span>
                                <p className="delete-message">
                                    Are you sure you want to delete your account? Your account will be permanently deleted in 2 days.
                                </p>
                            </div>
                            <div className="delete-actions">
                                <button
                                    className="delete-desactivate"
                                    type="button"
                                    onClick={handleDeleteAccount}
                                >
                                    Delete Account
                                </button>
                                <button
                                    className="delete-cancel"
                                    type="button"
                                    onClick={() => setShowDeleteDialog(false)}
                                >
                                    Cancel
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
