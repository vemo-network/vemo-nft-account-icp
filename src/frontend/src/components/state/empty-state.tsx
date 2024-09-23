import { ImageComponent } from "@components/images/render-image";
import React from "react";

export const EmptyState = ({ title }: { title: string }) => {
  return (
    <div className="flex justify-center items-end flex-col gap-2">
      <ImageComponent
        src="/icons/status/empty-state.svg"
        width={80}
        height={75}
        alt="empty-state"
        className="flex justify-center w-full"
      />
      <p className="italic text-sm text-center w-full">{title}</p>
    </div>
  );
};
