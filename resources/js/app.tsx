import React from "react";
import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Auth/Login";
import { Dashboard } from "./pages/Dashboard/index";
import { PurchaseEntry } from "./pages/Purchases/index";
import { PurchaseReport } from "./pages/Reports/PurchaseReport";
import { MasterData } from "./pages/MasterData/index";
import {
    WorkOrdersPageRoute,
    WorkOrderAddRoute,
    WorkOrderEditRoute,
} from "./pages/WorkOrders/index";
import { WorkOrderReport } from "./pages/Reports/WorkOrderReport";
import { OverdueWorkOrdersReport } from "./pages/Reports/OverdueWorkOrdersReport";
import { LedgerReport } from "./pages/Reports/LedgerReport";
import { ProfilePage } from "./pages/Profile/index";
import { VoucherList } from "./pages/Vouchers/VoucherList";
import { ExpiredPage } from "./pages/Error/Expired";
import { Toaster } from "react-hot-toast";

import { Provider, useSelector, useDispatch } from "react-redux";
import { store, RootState } from "./store";
import { loginSuccess, logout } from "./store/slices/authSlice";
import api from "./services/api";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated, user } = useSelector(
        (state: RootState) => state.auth,
    );
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }

    const isExpired =
        user?.tenant?.expires_at &&
        new Date(user.tenant.expires_at) < new Date();
    if (isExpired) {
        return <Navigate to="/expired" replace />;
    }

    return <Layout>{children}</Layout>;
};

const AppContent: React.FC = () => {
    const dispatch = useDispatch();
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);

    React.useEffect(() => {
        const fetchUser = async () => {
            const token = localStorage.getItem("ofm_token");
            if (token) {
                try {
                    const response = await api.get("/user");
                    dispatch(loginSuccess({ user: response.data, token }));
                } catch (error) {
                    console.error("Failed to fetch user", error);
                    dispatch(logout());
                }
            }
        };

        if (isAuthenticated) {
            fetchUser();
        }
    }, [dispatch]);

    return (
        <Router>
            <Toaster position="top-right" reverseOrder={false} />
            <Routes>
                <Route path="/login" element={<Login />} />
                <Route path="/expired" element={<ExpiredPage />} />
                {/* Protected Routes */}
                <Route
                    path="/"
                    element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/purchase"
                    element={
                        <ProtectedRoute>
                            <PurchaseEntry />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/purchase/:id/print"
                    element={<PurchaseReport />}
                />{" "}
                {/* No Layout for Print */}
                <Route
                    path="/workers"
                    element={
                        <ProtectedRoute>
                            <MasterData />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/settings"
                    element={
                        <ProtectedRoute>
                            <MasterData />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/work-orders"
                    element={
                        <ProtectedRoute>
                            <WorkOrdersPageRoute />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/work-orders/add"
                    element={
                        <ProtectedRoute>
                            <WorkOrderAddRoute />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/work-orders/:id/edit"
                    element={
                        <ProtectedRoute>
                            <WorkOrderEditRoute />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/work-orders/:id/print"
                    element={<WorkOrderReport />}
                />
                <Route
                    path="/profile"
                    element={
                        <ProtectedRoute>
                            <ProfilePage />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports/overdue"
                    element={
                        <ProtectedRoute>
                            <OverdueWorkOrdersReport />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/reports/ledger"
                    element={
                        <ProtectedRoute>
                            <LedgerReport />
                        </ProtectedRoute>
                    }
                />
                <Route
                    path="/vouchers"
                    element={
                        <ProtectedRoute>
                            <VoucherList />
                        </ProtectedRoute>
                    }
                />
                <Route path="*" element={<Navigate to="/" />} />
            </Routes>
        </Router>
    );
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <AppContent />
        </Provider>
    );
};

export default App;
