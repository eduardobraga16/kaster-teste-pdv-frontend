import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';

import Login from './components/Login';

import ProtectedRoute from './components/ProtectedRoute';
import PublicRoute from './components/PublicRoute';

import MainLayout from './layouts/MainLayout';

import Sales from './pages/Sales';
import SaleDetails from './pages/SaleDetails';
import Coupon from './pages/Coupon';
import Pdv from './pages/Pdv';

function App() {
    return (
        <BrowserRouter>
            <Routes>

                <Route element={<PublicRoute />}>
                    <Route
                        path="/login"
                        element={<Login />}
                    />
                </Route>

                <Route element={<ProtectedRoute />}>

                    <Route element={<MainLayout />}>

                        <Route
                            path="/sales"
                            element={<Sales />}
                        />

                        <Route
                            path="/sales/:id/details"
                            element={<SaleDetails />}
                        />

                        <Route
                            path="/pdv"
                            element={<Pdv />}
                        />

                    </Route>

                    <Route
                        path="/sales/:id/coupon"
                        element={<Coupon />}
                    />

                </Route>

                <Route
                    path="*"
                    element={<Navigate to="/sales" replace />}
                />

            </Routes>
        </BrowserRouter>
    );
}

export default App;