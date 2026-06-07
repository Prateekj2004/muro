import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { CartProvider } from "@/lib/cart";
import ScrollToHash from "./components/ScrollToHash";

import Navbar from "@/components/Navbar";
import Footer from "@/components/Footer";

import Index from "./pages/Index";
import Products from "./pages/Products";
import ProductDetail from "./pages/ProductDetail";
import Cart from "./pages/Cart";
import NotFound from "./pages/NotFound";
import About from "./pages/About";
import ShippingPolicy from "./pages/ShippingPolicy";
import PrivacyPolicy from "./pages/PrivacyPolicy";
import RefundPolicy from "./pages/RefundPolicy";
import TermsAndConditions from "./pages/Terms";
import FAQ from "./pages/FAQ";
import Auth from "./pages/Auth";
import Contact from "./pages/Contact";
import Profile from "./pages/Profile";
import AdminDashboard from "./pages/AdminDashboard";
import Postcards from "./pages/Postcards";
import PostcardDetails from "./pages/PostcardDetails";
import Cutouts from "./pages/Cutouts";
import CutoutDetails from "./pages/CutoutDetails";

const queryClient = new QueryClient();

const IsAdmin = ({ children }: { children: JSX.Element }) => {
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const isAdmin = user.role?.toUpperCase() === "ADMIN";

  return isAdmin ? children : <Navigate replace to="/login" />;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <CartProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <ScrollToHash />
          <Navbar />
          <Routes>
            <Route path="/" element={<Index />} />
            <Route path="/login" element={<Auth />} />
            <Route path="/signup" element={<Auth />} />
            <Route path="/about" element={<About />} />
            <Route path="/postcards" element={<Postcards />} />
            <Route path="/postcards/:id" element={<PostcardDetails />} />
            <Route path="/cutouts" element={<Cutouts />} />
            <Route path="/cutouts/:id" element={<CutoutDetails />} />
            <Route path="/shipping-policy" element={<ShippingPolicy />} />
            <Route path="/privacy" element={<PrivacyPolicy />} />
            <Route path="/cancellation-refund" element={<RefundPolicy />} />
            <Route path="/terms" element={<TermsAndConditions />} />
            <Route path="/faq" element={<FAQ />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/products" element={<Products />} />
            <Route path="/product/:id" element={<ProductDetail />} />
            <Route path="/cart" element={<Cart />} />
            <Route path="/profile" element={<Profile />} />
            <Route
              path="/admin/dashboard"
              element={
                <IsAdmin>
                  <AdminDashboard />
                </IsAdmin>
              }
            />
            <Route path="*" element={<NotFound />} />
          </Routes>
          <Footer />
        </BrowserRouter>
      </CartProvider>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
