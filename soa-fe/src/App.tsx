
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Admin from "./pages/Admin";
import Blog from "./pages/Blog";
import CreateTour from "./pages/CreateTour";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyTours from "./pages/MyTours";
import Register from "./pages/Register";
import Tour from "./pages/Tour";
import Header from "./layouts/Header";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Header />,
    //errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "blog", element: <Blog /> },
      { path: "tours", element: <Tour /> },
      { path: "create-tour", element: <CreateTour /> },
      { path: "my-tours", element: <MyTours /> },
      { path: "login", element: <Login /> },
      { path: "register", element: <Register /> },
      { path: "admin", element: <Admin /> },
      //{ path: "*", element: <ErrorPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}