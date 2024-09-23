import { ImageComponent } from "@components/images/render-image";
import { resetModalState } from "@store/modal-service";
import React from "react";
import { useDispatch } from "react-redux";
import { BaseModal } from ".";

export const BaseCreateModal = ({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) => {
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
          src="/images/create-modal-withdraw.png"
          width={220}
          height={260}
          alt="create-modal-withdraw"
          className="absolute right-[30px] top-[-130px]"
        />
        <div className="text-white text-xxl text-start mb-4 mt-[100px]">
          {title}
        </div>
        {children}
      </BaseModal>
    </>
  );
};
