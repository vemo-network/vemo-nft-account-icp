import React from "react";
import { formattingUtils } from "src/utils/formatting-utils";

export const WalletPoint = ({ point = "0" }: { point: string }) => {
  return (
    <>
      {!!Number(point) && (
        <div className="mt-4 flex flex-col gap-3">
          <p>Accumulated points</p>
          <div className="flex justify-between bg-grey-100 rounded-[8px] px-3 h-10 items-center">
            <p className="font-normal">Krystal points</p>
            <p className="text-lg">{formattingUtils.toLocalString(point)}</p>
          </div>
        </div>
      )}
    </>
  );
};
