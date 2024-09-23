import { SelectComponent } from "@components/select";
import clsx from "clsx";
import React, { useMemo } from "react";
import { IlUseCase } from "src/types/platform.type";

export const SelectAsset = ({
  currentAsset,
  setCurrentAsset,
  assets,
  disabled,
}: {
  currentAsset: IlUseCase | null;
  setCurrentAsset: (type: IlUseCase) => void;
  assets: IlUseCase[] | [];
  disabled: boolean;
}) => {
  const selectChains = useMemo(() => {
    return assets?.map((val, i) => ({
      label: (
        <div className="flex items-center gap-[6px] text-[16px] text-white font-medium ml-4">
          {val?.name}
        </div>
      ),
      value: `${val?.id}_${val?.name}`,
    }));
  }, [assets?.length]);
  const onSelectChain = (e: string) => {
    const id = e.split("_")[0];
    const asset = assets.find((e) => e.id === Number(id));
    asset && setCurrentAsset(asset);
  };
  return (
    <div className="w-1/2">
      <p className="text-sm py-3">Asset</p>
      <SelectComponent
        bgfill="dark"
        className={clsx(
          "w-full !h-12 !rounded-lg !bg-dark-600 text-[14px] pl-2"
        )}
        optionsData={selectChains}
        onSelect={onSelectChain}
        // defaultValue={currentAsset.name}
        // value={`${currentAsset?.name}_${currentAsset?.title}`}
        disabled={disabled}
        placeholder="Select"
      />
    </div>
  );
};
