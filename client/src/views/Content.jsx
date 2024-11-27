import { About } from "../routes/About";
import { Contact } from "../routes/Contact";
import { Home } from "../routes/Home";
import { Products } from "../routes/Products";
import { ErrorPage } from "../views/Error-Page";
import { createBrowserRouter, RouterProvider } from "react-router-dom";

const router = createBrowserRouter([
    {
        path: "/",
        element: <Home/>,
        errorElement: <ErrorPage />,
    },
    {
        path: "/products",
        element: <Products/>,
    },
    {
        path: "/about",
        element: <About/>,
    },
    {
        path: "/contact",
        element: <Contact/>,
    },
  ]);

export function Content() {
    return (
        <>
            <div className="m-4 mt-24 bg-yellow-600">
                <RouterProvider router={router} />
            </div>
        </>
    );
}