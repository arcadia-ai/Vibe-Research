import { createBrowserRouter, Navigate } from "react-router-dom";
import type { ReactNode } from "react";
import { Layout } from "@/components/layout/Layout";
import { DailyReview } from "@/pages/DailyReview";
import { Intel } from "@/pages/Intel";
import { Sectors } from "@/pages/Sectors";
import { SectorDetail } from "@/pages/SectorDetail";
import { Debate } from "@/pages/Debate";
import { Portfolio } from "@/pages/Portfolio";
import { StockData } from "@/pages/StockData";
import { Watchlist } from "@/pages/Watchlist";
import { MyReports } from "@/pages/MyReports";
import { Notes } from "@/pages/Notes";
import { Settings } from "@/pages/Settings";
import { Login } from "@/pages/Login";
import { useAuth } from "@/lib/auth";

function AdminRoute({ children }: { children: ReactNode }) {
  const { authenticated, loading } = useAuth();
  if (loading) return null;
  return authenticated ? children : <Navigate to="/login" replace />;
}

export const router = createBrowserRouter([
  {
    element: <Layout />,
    children: [
      { path: "/", element: <Navigate to="/daily-review" replace /> },
      { path: "/daily-review", element: <DailyReview /> },
      { path: "/intel", element: <Intel /> },
      { path: "/sectors", element: <Sectors /> },
      { path: "/sectors/:key", element: <SectorDetail /> },
      { path: "/login", element: <Login /> },
      { path: "/portfolio", element: <AdminRoute><Portfolio /></AdminRoute> },
      { path: "/stock-data", element: <StockData /> },
      { path: "/debate", element: <AdminRoute><Debate /></AdminRoute> },
      { path: "/watchlist", element: <Watchlist /> },
      { path: "/my-reports", element: <AdminRoute><MyReports /></AdminRoute> },
      { path: "/notes", element: <AdminRoute><Notes /></AdminRoute> },
      { path: "/settings", element: <AdminRoute><Settings /></AdminRoute> },
    ],
  },
]);
