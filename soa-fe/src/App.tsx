
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Admin from "./pages/Admin";
import AvailableTours from "./pages/AvailableTours";
import Blog from "./pages/Blog";
import CreateTour from "./pages/CreateTour";
import Home from "./pages/Home";
import Login from "./pages/Login";
import MyTours from "./pages/MyTours";
import Register from "./pages/Register";
import ShoppingCart from "./pages/ShoppingCart";
import Tour from "./pages/Tour";
import TourDetails from "./pages/TourDetails";
import Header from "./layouts/Header";
import BlogDetails from "./pages/BlogDetails";
import CreateTour2 from "./pages/CreateTour2";
import MyTours2 from "./pages/MyTours2";

const router = createBrowserRouter([
  {
    path: "/",
    element: <Header />,
    //errorElement: <ErrorPage />,
    children: [
      { index: true, element: <Home /> },
      { path: "blog", element: <Blog /> },
      { path: "blog/:id", element: <BlogDetails /> },
      { path: "tours", element: <Tour /> },
      { path: "available-tours", element: <AvailableTours /> },
      { path: "tour/:tourId", element: <TourDetails /> },
      { path: "create-tour", element: <CreateTour /> },
      { path: "create-tour2", element: <CreateTour2 /> },
      { path: "my-tours", element: <MyTours /> },
      { path: "my-tours2", element: <MyTours2 /> },
      { path: "shopping-cart", element: <ShoppingCart /> },
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