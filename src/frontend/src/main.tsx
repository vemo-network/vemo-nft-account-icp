import "@rainbow-me/rainbowkit/styles.css";
import {
  darkTheme,
  getDefaultConfig,
  lightTheme,
  RainbowKitProvider,
} from "@rainbow-me/rainbowkit";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import * as React from "react";
import * as ReactDOM from "react-dom/client";
import { WagmiProvider } from "wagmi";
import { App } from "./App";
import { config, wagmiConfig } from "./wagmi";
import "@/style/global.css";
import { StyleProvider } from "@ant-design/cssinjs";
import LoadingOverlay from "@components/loading-overlay";
import { GlobalProvider } from "@context/provider/GlobalProvider";
import ConfigProvider from "antd/es/config-provider";
import { Provider } from "react-redux";
import { BrowserRouter } from "react-router-dom";
import store from "./store";
import { ConnectStatus, WalletStatus } from "./types/smart-wallet";
import { saveLocalStorageData } from "./utils/storage.utils";

const queryClient = new QueryClient();
saveLocalStorageData(WalletStatus.SIGNING, ConnectStatus.FINISHED);
localStorage.removeItem('token-import')
ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <WagmiProvider config={wagmiConfig}>
      <QueryClientProvider client={queryClient}>
        <RainbowKitProvider
          theme={darkTheme({
            accentColor: "#25262c",
          })}
        >
          <Provider store={store}>
            <BrowserRouter>
              <ConfigProvider>
                <StyleProvider layer>
                  <GlobalProvider />
                  <App />
                  <LoadingOverlay />
                </StyleProvider>
              </ConfigProvider>
            </BrowserRouter>
          </Provider>
        </RainbowKitProvider>
      </QueryClientProvider>
    </WagmiProvider>
  </React.StrictMode>
);
