import React from "react";
import {
    HashRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { Layout } from "./components/Layout";
import { Login } from "./pages/Login";
import { Dashboard } from "./pages/Dashboard";
import { PurchaseEntry } from "./pages/PurchaseEntry";
import { PurchaseReport } from "./pages/PurchaseReport";
import { MasterData } from "./pages/MasterData";
import { WorkOrders } from "./pages/WorkOrders";
import { WorkOrderReport } from "./pages/WorkOrderReport";
import { OverdueWorkOrdersReport } from "./pages/OverdueWorkOrdersReport";

import { Provider, useSelector } from "react-redux";
import { store, RootState } from "./store";

// Protected Route Component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({
    children,
}) => {
    const { isAuthenticated } = useSelector((state: RootState) => state.auth);
    if (!isAuthenticated) {
        return <Navigate to="/login" replace />;
    }
    return <Layout>{children}</Layout>;
};

const App: React.FC = () => {
    return (
        <Provider store={store}>
            <Router>
                <Routes>
                    <Route path="/login" element={<Login />} />
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
                                <WorkOrders />
                            </ProtectedRoute>
                        }
                    />
                    <Route
                        path="/work-orders/:id/print"
                        element={<WorkOrderReport />}
                    />
                    <Route
                        path="/reports/overdue"
                        element={
                            <ProtectedRoute>
                                <OverdueWorkOrdersReport />
                            </ProtectedRoute>
                        }
                    />
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </Router>
        </Provider>
    );
};

export default App;
