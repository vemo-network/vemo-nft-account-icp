import React from "react";
import { useLogin, useLogout } from "src/hooks/use-auth";
import { ModalProvider } from "./ModalProvider";
import { useWalletsOnchain } from "src/hooks/use-wallet";

export const GlobalProvider = () => {
  useLogin();
  useLogout();
  // useWalletsOnchain()
  return <></>;
};
