import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider } from './context/AuthContext';
import { BirthdayProvider } from './context/BirthdayContext';
import Layout from './components/Layout';
import Dashboard from './pages/Dashboard';
import BirthdayForm from './pages/BirthdayForm';
import Login from './pages/Login';
import Register from './pages/Register';
import AdminPanel from './pages/AdminPanel';

const queryClient = new QueryClient();

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BirthdayProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/" element={<Layout />}>
                <Route index element={<Dashboard />} />
                <Route path="add" element={<BirthdayForm />} />
                <Route path="edit/:id" element={<BirthdayForm />} />
                <Route path="login" element={<Login />} />
                <Route path="register" element={<Register />} />
                <Route path="admin" element={<AdminPanel />} />
              </Route>
            </Routes>
          </BrowserRouter>
        </BirthdayProvider>
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;