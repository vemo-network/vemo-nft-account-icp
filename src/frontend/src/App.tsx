import { Navigate, Outlet, Route, Routes } from "react-router-dom";
import { SmartWalletProvider } from "./context/smart-wallet-context";
import { DefaultLayout } from "./layouts/default-layout";
import { Point } from "./views/point";
import { BASE_PATH } from "./configs/constants";

declare global {
  interface Window {
    // ethereum?: WindowProvider
    ethereum?: any; // CoinbaseWalletSDK also defines window.ethereum, so we have to work around that :(
  }
}

export function App() {
  return (
    <Routes>
      <Route
        element={
          <DefaultLayout bodyWidth="grid-screen">
            <Outlet />
          </DefaultLayout>
        }
      >
        <Route
          path={BASE_PATH}
          element={
            <SmartWalletProvider>
              <Point />
            </SmartWalletProvider>
          }
        />
        {/* <Route path="/404" element={<NotFound />} /> */}
        {/* <Route path="*" element={<Navigate to="/404" replace />} /> */}
      </Route>{" "}
    </Routes>
  );
}
