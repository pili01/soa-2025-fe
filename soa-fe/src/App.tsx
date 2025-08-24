
import {
  createBrowserRouter,
  RouterProvider,
} from "react-router-dom";

import "bootstrap/dist/css/bootstrap.min.css";
import "bootstrap/dist/js/bootstrap.bundle.min.js";

import Header from "./layouts/Header";
import Blog from "./pages/Blog";
import CreateTour from "./pages/CreateTour";
import Home from "./pages/Home";
import MyTours from "./pages/MyTours";
import Tour from "./pages/Tour";

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
      //{ path: "*", element: <ErrorPage /> },
    ],
  },
]);

export default function App() {
  return <RouterProvider router={router} />;
}