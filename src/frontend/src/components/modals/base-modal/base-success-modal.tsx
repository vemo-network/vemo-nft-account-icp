import { ImageComponent } from "@components/images/render-image";
import { resetModalState } from "@store/modal-service";
import React from "react";
import { useDispatch } from "react-redux";
import { BaseModal } from "../base-modal";

interface CreateWalletDataProps {
  title: string;
  children: React.ReactNode;
}

export function BaseModalSuccess({
  title,
  children,
}: CreateWalletDataProps) {
  const dispatch = useDispatch();
  const handleClose = () => {
    dispatch(resetModalState());
  };
  return (
    <>
      <BaseModal
        open
        className="!w-[448px] h-[500px] relative"
        onClose={handleClose}
      >
        <ImageComponent
          src="/icons/status/create-wallet-success.svg"
          width={186}
          height={260}
          alt="create-modal-icon"
          className="absolute right-[30px] top-[-130px]"
        />
        <div className="text-white !text-xxl text-start mb-4 mt-[80px] font-medium">
          {title}
          <span className="text-green-100 !text-xxl"> Successfully</span>
        </div>
        {children}
      </BaseModal>
    </>
  );
}
