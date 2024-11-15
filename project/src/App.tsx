import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Header } from './components/layout/Header';
import { BottomNav } from './components/layout/BottomNav';
import { Home } from './pages/Home';
import { Settings } from './pages/Settings';
import { CreateRecipe } from './pages/CreateRecipe';
import { EditRecipe } from './pages/EditRecipe';
import { Auth } from './pages/Auth';
import { RecipeDetails } from './pages/RecipeDetails';
import { MyRecipes } from './pages/MyRecipes';
import { Following } from './pages/Following';
import { Favorites } from './pages/Favorites';
import { UserProfile } from './pages/UserProfile';
import { AdminMessages } from './pages/AdminMessages';
import { ThemeProvider } from './contexts/ThemeContext';
import { UserProvider } from './contexts/UserContext';
import { CommentProvider } from './contexts/CommentContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { RecipeProvider } from './contexts/RecipeContext';
import { SettingsProvider } from './contexts/SettingsContext';

const PrivateRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const isAuthenticated = localStorage.getItem('user') !== null;
  return isAuthenticated ? <>{children}</> : <Navigate to="/auth" replace />;
};

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <UserProvider>
          <NotificationProvider>
            <RecipeProvider>
              <CommentProvider>
                <SettingsProvider>
                  <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex flex-col">
                    <Header />
                    <Routes>
                      <Route path="/" element={<Home />} />
                      <Route path="/auth" element={<Auth />} />
                      <Route path="/recipe/:id" element={<RecipeDetails />} />
                      <Route
                        path="/recipe/:id/edit"
                        element={
                          <PrivateRoute>
                            <EditRecipe />
                          </PrivateRoute>
                        }
                      />
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
                        path="/following"
                        element={
                          <PrivateRoute>
                            <Following />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/user/:id"
                        element={
                          <PrivateRoute>
                            <UserProfile />
                          </PrivateRoute>
                        }
                      />
                      <Route
                        path="/admin/messages"
                        element={
                          <PrivateRoute>
                            <AdminMessages />
                          </PrivateRoute>
                        }
                      />
                    </Routes>
                    <BottomNav />
                  </div>
                </SettingsProvider>
              </CommentProvider>
            </RecipeProvider>
          </NotificationProvider>
        </UserProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}