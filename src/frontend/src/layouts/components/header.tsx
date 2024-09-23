import { ImageComponent } from "@components/images/render-image";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import clsx from "clsx";
import React from "react";
import { CustomConnectButton } from "./custom-connect-button";
import { DropdownSelectChain } from "./dropdown-select-chain";
import MenuDrawer from "./menu-drawer";
import { BASE_PATH } from "src/configs/constants";

const headerTabs = [
  {
    title: "NFT Account",
    url: BASE_PATH,
  },
  {
    title: "IVO",
    url: "https://app.vemo.network/ivo",
    isExternal: false,
  },
  {
    title: "Marketplace",
    url: "https://market.vemo.network/",
    isExternal: true,
  },
];
const handleLink = (link: any) => {
  if (!link.url) return;
  if (link.url && link?.isExternal) {
    return window.open(link.url);
  }
  window.location.href = link.url;
};
const handleBackToHome = () => {
  window.open("https://vemo.network/");
};
export const Header = () => {
  return (
    <div className=" z-10 relative">
      <header className="flex py-3 container mx-auto items-center justify-between h-[88px]">
        <div className="flex items-center gap-10 h-full">
          <div className="flex gap-3 items-center relative">
            <div className="flex lg:hidden py-6 lg:justify-center cursor-pointer">
              <MenuDrawer />
            </div>
            <ImageComponent
              src="/images/logo.svg"
              width={100}
              height={26}
              alt="logo-header"
              onClick={handleBackToHome}
              className="cursor-pointer relative z-100"
            />
          </div>
          <div className=" gap-10 items-center h-full hidden lg:flex">
            {headerTabs.map((e) => (
              <div
                className="cursor-pointer h-full justify-center items-center flex relative z-100"
                onClick={() => handleLink(e)}
              >
                <div
                  key={e.title}
                  className={clsx(
                    "font-medium  relative ",
                    e.title === "NFT Account" &&
                      "border-b-[2px] border-[#0047FF]", 
                      e.title === "NFT Account" ? "mr-8":''
                  )}
                >
                  {e.title}
                  {e.title === "NFT Account" && (
                    <div className="flex rounded-lg bg-green-100 justify-center items-center absolute px-2 top-0 text-[10px] right-[-40px]">
                      Beta
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
        <div className="flex lg:hidden gap-3">
          <DropdownSelectChain />
          {/* <ConnectButton accountStatus="avatar" /> */}
          <CustomConnectButton />
        </div>
        <div className="hidden lg:flex gap-3">
          <DropdownSelectChain />
          {/* <ConnectButton /> */}
          <CustomConnectButton />
        </div>
        {/* <CustomConnectButton/> */}
      </header>
    </div>
  );
};
