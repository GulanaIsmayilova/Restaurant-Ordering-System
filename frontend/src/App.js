import React from 'react';
import {BrowserRouter as Router, Route, Routes} from 'react-router-dom';
import {ThemeProvider} from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import theme from './theme';
import Layout from './components/layout/Layout';
import LoginPage from './pages/LoginPage';
import Kitchen from './pages/Kitchen';
import WaiterPage from './pages/WaiterPage';
import MenuPage from './pages/MenuPage';
import AdminPage from './pages/AdminPage';
import MenuManagement from './pages/MenuManagement';
import AdminRoute from './components/AdminRoute';
import StaffRoute from './components/StaffRoute';
import QRScanner from "./pages/QRScanner";

const App = () => {
    return (
        <ThemeProvider theme={theme}>
            <CssBaseline/>
            <Router>
                <Routes>
                    <Route path="/login" element={<LoginPage/>}/>
                    <Route path="/table/:tableId" element={<MenuPage/>}/>

                    {/* Admin Routes */}
                    <Route
                        path="/admin"
                        element={
                            <AdminRoute>
                                <Layout>
                                    <AdminPage/>
                                </Layout>
                            </AdminRoute>
                        }
                    />
                    <Route
                        path="/admin/menu-management"
                        element={
                            <AdminRoute>
                                <Layout>
                                    <MenuManagement/>
                                </Layout>
                            </AdminRoute>
                        }
                    />


                    {/* Staff Routes */}
                    <Route
                        path="/kitchen"
                        element={
                            <StaffRoute>
                                <Layout>
                                    <Kitchen/>
                                </Layout>
                            </StaffRoute>
                        }
                    />
                    <Route
                        path="/waiter"
                        element={
                            <StaffRoute>
                                <Layout>
                                    <WaiterPage/>
                                </Layout>
                            </StaffRoute>
                        }
                    />

                    {/* Default Route */}
                    <Route path="/" element={<QRScanner/>}/>
                </Routes>
            </Router>
        </ThemeProvider>
    );
};

export default App; 