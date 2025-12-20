import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

export const PATHS = {
  INDEX: "/",
  HOME: "/home",
  SEND_INFO: "/send-info",
  TIMEACTIVE: "/business-team-chat",
};

// Import Home (form page)
const Home = lazy(() => import("@/pages/home"));
const SendInfo = lazy(() => import("@/pages/send-info"));
const NotFound = lazy(() => import("@/pages/not-found"));

const withSuspense = (Component) => (
  <Suspense fallback={<div></div>}>{Component}</Suspense>
);

const router = createBrowserRouter([
  {
    path: PATHS.INDEX, // "/"
    element: withSuspense(<Home />), // Home là trang chính
  },
  {
    path: PATHS.HOME, // "/home" 
    element: withSuspense(<Home />), // Form page
  },
  {
    path: PATHS.SEND_INFO, // "/send-info"
    element: withSuspense(<SendInfo />),
  },
  {
    path: `${PATHS.TIMEACTIVE}/*`, // "/business-team/*" - GIỮ NGUYÊN
    element: withSuspense(<Home />), // THAY Index BẰNG Home
  },
  {
    path: "*", // Tất cả đường dẫn khác
    element: withSuspense(<NotFound />),
  },
]);

export default router;
