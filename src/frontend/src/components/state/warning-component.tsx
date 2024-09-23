import { ImageComponent } from "@components/images/render-image";
import React from "react";

export const WarningComponent = () => {
  return (
    <div className="flex bg-warning-bg py-3 px-4 rounded-[8px] mt-4 items-center gap-3 flex-col md:flex-row">
      <ImageComponent
        src="/icons/status/warning-icon.svg"
        width={40}
        height={40}
        alt="warning-icon"
      />
      <p className="italic  text-sm text-orange-100 font-semibold leading-[16px]">
        Warning:
        <span className="font-normal text-xxs text-justify md:text-start">
          {" "}
          Certain partner dApps verify the NFT account's native coin balance for
          transaction fees (ex: ETH on Ethereum mainnet). We recommend
          depositing a small amount to bypass this process. Don’t worry,
          transactions will not spend your native coins in the NFT account; the
          deposit is solely for verification purposes and can be withdrawn
          whenever you choose.
        </span>
      </p>
    </div>
  );
};
