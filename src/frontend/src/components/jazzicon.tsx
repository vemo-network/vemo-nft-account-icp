import jazzicon from "@metamask/jazzicon";
import React, { useEffect, useRef } from "react";
import { getSeedJazzIcon } from "src/utils/wallet.util";

export const AvatarIcon = ({
  address,
  chainId,
}: {
  address: string;
  chainId?: number;
}) => {
  const avatarRef = useRef(null);
  useEffect(() => {
    const element: any = avatarRef.current;
    if (element && address) {
      const icon = jazzicon(
        26,
        getSeedJazzIcon(address) + Number(chainId ?? 0) * 10
      ); //generates a size 20 icon
      if (element?.firstChild) {
        element?.removeChild(element?.firstChild);
      }
      element?.appendChild(icon);
    }
  }, [address, avatarRef]);
  return (
    <>
      {" "}
      {avatarRef && (
        <div
          ref={avatarRef}
          className="flex items-center border-[1px] border-blue-700 p-[2px] rounded-[50%]"
        />
      )}
    </>
  );
};
