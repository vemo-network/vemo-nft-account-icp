import { ImageComponent } from "@components/images/render-image";
import { BaseDrawer } from "@components/menu/drawer-menu";
import Drawer from "antd/lib/drawer";
import clsx from "clsx";
import { useState } from "react";
import { Link, matchPath } from "react-router-dom";
import { BASE_PATH } from "src/configs/constants";

const NAV_CATEGORY_DATA = [
  {
    label: "NFT Account",
    path: BASE_PATH,
    activeEndpoint: [""],
    isExternal: false,
  },
  {
    label: "IVO",
    path: "https://app.vemo.network/ivo",
    activeEndpoint: [""],
    isExternal: false,
  },
  {
    label: "Marketplace",
    path: "https://market.vemo.network/",
    activeEndpoint: [""],
    isExternal: true,
  },
];

function MenuDrawer() {
  const [open, setOpen] = useState(false);

  const showDrawer = () => {
    setOpen(!open);
  };

  const onClose = () => {
    setOpen(false);
  };

  const listnav = (
    <nav className="!text-white flex flex-col lg:flex-row gap-10 xl:gap-12 cursor-pointer relative h-[100vh] p-4 mt-2">
      <ImageComponent
        src="/images/logo.svg"
        width={100}
        height={26}
        alt="logo-header"
      />{" "}
      {NAV_CATEGORY_DATA.map((i, idx) => (
        <div onClick={onClose} key={idx}>
          {i?.isExternal ? (
            <a
              href={i?.path}
              className={clsx("flex flex-col text-base", "!text-white")}
              target="_blank"
            >
              {i?.label}
           
            </a>
          ) : (
            <Link
              to={i?.path}
              className={clsx(
                "text-base w-fit text-dark-strong-blue relative",
                !!i.activeEndpoint.find(
                  (i) => !!matchPath(window?.location?.pathname, i)
                )
                  ? "text-light-blue"
                  : "text-white"
              )}
            >
              {i?.label}
              {i.label === "NFT Account" && (
                <div className="flex rounded-lg bg-green-100 justify-center items-center absolute px-2 top-0 text-[10px] right-[-40px] bottom-0">
                  Beta
                </div>
              )}
            </Link>
          )}
        </div>
      ))}
    </nav>
  );

  return (
    <>
      <ImageComponent
        src="/icons/menu-icon.svg"
        width={24}
        height={24}
        alt="menu-icon"
        onClick={showDrawer}
      />
      <BaseDrawer
        title={
          <div className="flex justify-end relative z-10">
            <div
              className="flex items-center justify-center mt-14 w-10 h-10 -mr-3"
              onClick={onClose}
            >
              <ImageComponent
                src="/icons/close-no-circle.svg"
                width={14}
                height={14}
                alt="menu-close-icon"
              />{" "}
            </div>
          </div>
        }
        closable={false}
        placement="left"
        className="block md:hidden"
        onClose={onClose}
        visible={open}
        bodyStyle={{
          backgroundColor: "#2C2F37",
        }}
      >
        {listnav}
      </BaseDrawer>
    </>
  );
}

export default MenuDrawer;
