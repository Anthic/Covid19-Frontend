import { createBrowserRouter } from "react-router-dom";
import MainLayout from "../MainLayout/MainLayout";
import HomePage from "../Pages/HomePage";
import PredictionPage from "../Pages/PredictionPage";
import ContactPage from "../Pages/ContactPage";
import LoginPage from "../Pages/LoginPage";
import { HistoryPage } from "../Pages/History";
import Protected from "./Protected";


export const router = createBrowserRouter([
  {
    path: "/",
    element: <MainLayout />,
    children: [
      {
        path: "/",
        element: <HomePage />,
      },
      {
        path: "/prediction",
        element: (
          <Protected>
            <PredictionPage />
          </Protected>
        ),
      },
      {
        path: "/contact",
        element: <ContactPage />,
      },
      {
        path: "/login",
        element: <LoginPage />,
      }, {
        path: "/history",
        element: (
          <Protected>
            <HistoryPage />
          </Protected>
        ),
      },
    ],
  },
]);
