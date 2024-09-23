import { PrimaryButton } from "@components/buttons/primary-button";
import { ImageComponent } from "@components/images/render-image";
import jazzicon from "@metamask/jazzicon";
import { ConnectButton } from "@rainbow-me/rainbowkit";
import { ZeroAddress } from "ethers6";
import { useRef } from "react";
import { formattingUtils } from "src/utils/formatting-utils";
import { getSeedJazzIcon } from "src/utils/wallet.util";

export const CustomConnectButton = () => {
  const avatarRef = useRef(null);

  return (
    <ConnectButton.Custom>
      {({
        account,
        chain,
        openAccountModal,
        openChainModal,
        openConnectModal,
        authenticationStatus,
        mounted,
      }) => {
        // Note: If your app doesn't use authentication, you
        // can remove all 'authenticationStatus' checks
        const ready = mounted && authenticationStatus !== "loading";
        const connected =
          ready &&
          account &&
          chain &&
          (!authenticationStatus || authenticationStatus === "authenticated");
        const icon = jazzicon(24, getSeedJazzIcon(account?.address ?? ZeroAddress));
        const element: any = avatarRef.current;
        if (element?.firstChild) {
          element?.removeChild(element?.firstChild);
        }
        element?.appendChild(icon);

        return (
          <div
            {...(!ready && {
              "aria-hidden": true,
              style: {
                opacity: 0,
                pointerEvents: "none",
                userSelect: "none",
              },
            })}
          >
            {(() => {
              if (!connected) {
                return (
                  <PrimaryButton
                    onClick={openConnectModal}
                    className="!h-10 px-4 !font-bold"
                  >
                    Connect Wallet
                  </PrimaryButton>
                );
              }
              // if (chain.unsupported) {
              //   return (
              //     <button onClick={openChainModal} type="button">
              //       Wrong network
              //     </button>
              //   );
              // }
              return (
                <div className="!text-xs h-10 !py-px sm:rounded-[10px] sm:px-3 rounded-full border-none  px-2 relative cursor-pointer flex justify-center items-center gap-2">
                  <div className="!bg-[#FFFFFF] opacity-5  absolute w-full h-full rounded-full " />

                  {/* <button
                    onClick={openChainModal}
                    style={{ display: "flex", alignItems: "center" }}
                    type="button"
                  >
                    {chain.hasIcon && (
                      <div
                        style={{
                          background: chain.iconBackground,
                          width: 12,
                          height: 12,
                          borderRadius: 999,
                          overflow: "hidden",
                          marginRight: 4,
                        }}
                      >
                        {chain.iconUrl && (
                          <img
                            alt={chain.name ?? "Chain icon"}
                            src={chain.iconUrl}
                            style={{ width: 12, height: 12 }}
                          />
                        )}
                      </div>
                    )}
                    {chain.name}
                  </button> */}
                  <button
                    onClick={openAccountModal}
                    type="button"
                    className="font-bold text-[16px] px-0 md:px-2 flex gap-2 justify-center items-center relative z-10"
                  >
                    <div ref={avatarRef} className="flex items-center" />
                    <p className="hidden md:block">
                      {" "}
                      {formattingUtils.centerEllipsizeString(
                        account.address,
                        5,
                        4
                      )}
                    </p>
                    {/* <div className="sm:block hidden">
                      <ImageComponent
                        src="/icons/chevron-down-icon.svg"
                        width={18}
                        height={18}
                        alt="chevron-right-icon"
                      />
                    </div> */}
                  </button>
                </div>
              );
            })()}
          </div>
        );
      }}
    </ConnectButton.Custom>
  );
};
