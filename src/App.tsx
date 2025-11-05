import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Landing } from '@/pages/Landing';
import { Auth } from '@/pages/Auth';
import Pricing from '@/pages/Pricing';
import { Onboarding } from '@/pages/Onboarding';
import { Dashboard } from '@/pages/Dashboard';
import { LogMeal } from '@/pages/LogMeal';
import { BarcodeScan } from '@/pages/BarcodeScan';
import { VideoUpload } from '@/pages/VideoUpload';
import { Admin } from '@/pages/Admin';
import ProtectedRoute from '@/components/ProtectedRoute';
import { Toaster } from '@/components/ui/toaster';
import './App.css';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/pricing" element={<Pricing />} />
        <Route path="/onboarding" element={
          <ProtectedRoute>
            <Onboarding />
          </ProtectedRoute>
        } />
        <Route path="/dashboard" element={
          <ProtectedRoute>
            <Dashboard />
          </ProtectedRoute>
        } />
        <Route path="/log-meal" element={
          <ProtectedRoute>
            <LogMeal />
          </ProtectedRoute>
        } />
        <Route path="/barcode-scan" element={
          <ProtectedRoute>
            <BarcodeScan />
          </ProtectedRoute>
        } />
        <Route path="/upload-video" element={
          <ProtectedRoute>
            <VideoUpload />
          </ProtectedRoute>
        } />
        <Route path="/admin" element={
          <ProtectedRoute>
            <Admin />
          </ProtectedRoute>
        } />
      </Routes>
      <Toaster />
    </BrowserRouter>
  );
}

export default App;
