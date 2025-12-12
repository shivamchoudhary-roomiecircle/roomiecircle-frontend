import { Toaster } from "@/components/ui/toaster";
import { HelmetProvider } from 'react-helmet-async';
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { GoogleOAuthProvider } from '@react-oauth/google';
import { AuthProvider } from "./contexts/AuthContext";
import { ChatProvider } from "./contexts/ChatContext";
import { ThemeProvider } from "./components/ThemeProvider";
import ProtectedRoute from "./components/ProtectedRoute";
import Index from "./pages/Index";
import CreateRoomListing from "./pages/CreateRoomListing";
import Wishlist from "./pages/Wishlist";
import EditRoomListing from "./pages/EditRoomListing";
import Profile from "./pages/Profile";
import MyListings from "./pages/MyListings";
import ViewRoomListingDetailed from "./pages/ViewRoomListingDetailed.tsx";
import Signup from "./pages/auth/Signup";
import Login from "./pages/auth/Login";
import Messages from "./pages/Messages";
import NotFound from "./pages/NotFound";
import ComingSoon from "./pages/ComingSoon";
import TermsOfService from "./pages/TermsOfService";
import PrivacyPolicy from "./pages/PrivacyPolicy";

const queryClient = new QueryClient();
const GOOGLE_CLIENT_ID = "485816600289-hgcsah1r27iopptput2o71rbal0g8es3.apps.googleusercontent.com";


const App = () => (
  <GoogleOAuthProvider clientId={GOOGLE_CLIENT_ID}>
    <HelmetProvider>
      <QueryClientProvider client={queryClient}>
        <ThemeProvider>
          <AuthProvider>
            <ChatProvider>
              <TooltipProvider>
                <Toaster />
                <Sonner />
                <BrowserRouter future={{ v7_startTransition: true, v7_relativeSplatPath: true }}>
                  <Routes>
                    <Route path="/" element={<Index />} />
                    <Route path="/auth/signup" element={<Signup />} />
                    <Route path="/auth/login" element={<Login />} />
                    <Route path="/create-listing" element={<ProtectedRoute><CreateRoomListing /></ProtectedRoute>} />
                    <Route path="/edit-listing" element={<ProtectedRoute><EditRoomListing /></ProtectedRoute>} />
                    <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
                    <Route path="/wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />

                    <Route path="/my-listings" element={<ProtectedRoute><MyListings /></ProtectedRoute>} />
                    <Route path="/messages" element={<ProtectedRoute><Messages /></ProtectedRoute>} />
                    <Route path="/listings/:id" element={<ViewRoomListingDetailed />} />
                    <Route path="/roommates" element={<ComingSoon />} />
                    <Route path="/rooms" element={<Index />} />
                    <Route path="/terms" element={<TermsOfService />} />
                    <Route path="/privacy" element={<PrivacyPolicy />} />
                    {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
                    <Route path="*" element={<NotFound />} />
                  </Routes>
                </BrowserRouter>
              </TooltipProvider>
            </ChatProvider>
          </AuthProvider>
        </ThemeProvider>
      </QueryClientProvider>
    </HelmetProvider>
  </GoogleOAuthProvider>
);

export default App;
