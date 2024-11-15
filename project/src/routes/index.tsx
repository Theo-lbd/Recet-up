import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Header } from '../components/layout/Header';
import { BottomNav } from '../components/layout/BottomNav';
import { Home } from '../pages/Home';
import { Settings } from '../pages/Settings';
import { CreateRecipe } from '../pages/CreateRecipe';
import { RecipeDetails } from '../pages/RecipeDetails';
import { MyRecipes } from '../pages/MyRecipes';
import { Favorites } from '../pages/Favorites';
import { Auth } from '../pages/Auth';
import { AdminMessages } from '../pages/AdminMessages';
import { useUser } from '../contexts/UserContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  
  if (!user) {
    return <Navigate to="/auth" replace />;
  }
  
  return <>{children}</>;
};

const AdminRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user } = useUser();
  
  if (!user || user.email !== 'theo.labadie@outlook.com') {
    return <Navigate to="/" replace />;
  }
  
  return <>{children}</>;
};

export const AppRoutes = () => {
  return (
    <>
      <Header />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/auth" element={<Auth />} />
        <Route path="/recipe/:id" element={<RecipeDetails />} />
        <Route
          path="/settings"
          element={
            <PrivateRoute>
              <Settings />
            </PrivateRoute>
          }
        />
        <Route
          path="/create"
          element={
            <PrivateRoute>
              <CreateRecipe />
            </PrivateRoute>
          }
        />
        <Route
          path="/my-recipes"
          element={
            <PrivateRoute>
              <MyRecipes />
            </PrivateRoute>
          }
        />
        <Route
          path="/favorites"
          element={
            <PrivateRoute>
              <Favorites />
            </PrivateRoute>
          }
        />
        <Route
          path="/admin/messages"
          element={
            <AdminRoute>
              <AdminMessages />
            </AdminRoute>
          }
        />
      </Routes>
      <BottomNav />
    </>
  );
};