import { createBrowserRouter } from "react-router";
import { lazy, Suspense } from "react";

export const PATHS = {
  INDEX: "/",
  HOME: "/home",
  VERIFY: "/verify",
  SEND_INFO: "/send-info",
  TIMEACTIVE: "/business-team-chat",
};

// XÓA import Index, THAY BẰNG Home
const Home = lazy(() => import("@/pages/home"));
const Verify = lazy(() => import("@/pages/verify"));
const SendInfo = lazy(() => import("@/pages/send-info"));
const NotFound = lazy(() => import("@/pages/not-found"));

const withSuspense = (Component) => (
  <Suspense fallback={<div></div>}>{Component}</Suspense>
);

const router = createBrowserRouter([
  {
    path: PATHS.INDEX, // "/"
    element: withSuspense(<Home />), // HIỂN THỊ HOME THAY VÌ NOT FOUND
  },
  {
    path: PATHS.HOME, // "/home" 
    element: withSuspense(<Home />),
  },
  {
    path: PATHS.VERIFY, // "/verify"
    element: withSuspense(<Verify />),
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
