import { FC, ReactNode } from "react";
import "./index.css";
import { ImageComponent } from "@components/images/render-image";
import Modal, { ModalProps } from "antd/es/modal";
import clsx from "clsx";

interface Props extends ModalProps {
  onClose?: () => void | undefined;
  typeMode?: "default" | "white" | "blue";
  customCloseIcon?: ReactNode;
  isNeedCloseIcon?: boolean;
}

export const BaseModal: FC<Props> = ({
  title,
  typeMode = "default",
  children,
  customCloseIcon,
  onClose,
  isNeedCloseIcon = true,
  ...rest
}) => {
  function getMode() {
    if (typeMode === "white") return "";
    if (typeMode === "blue") return "blue-modal";
    return "dark-modal";
  }

  return (
    <Modal
      className={clsx("rounded-lg relative", ...(rest.className as any))}
      centered
      wrapClassName={getMode()}
      footer={null}
      closeIcon={
        <div
          onClick={onClose}
          className="hidden justify-end h-full -translate-y-6 translate-x-6 md:flex absolute right-[-10px] top-[-10px] "
        >
          {!!onClose &&
            (!!customCloseIcon ? (
              customCloseIcon
            ) : (
              <>
                <ImageComponent
                  className="hidden sm:block"
                  src="/icons/close-icon.svg"
                  width={24}
                  height={24}
                  alt="close-icon-modal"
                />
              </>
            ))}
        </div>
      }
      closable={!!onClose}
      {...rest}
    >
      {title && (
        <h1 className="pt-7 text-center text-4xl font-light bg-gradients-cerulean-blue text-white uppercase">
          {title}
        </h1>
      )}
      <div className="min-h-fit flex flex-col justify-center">{children}</div>
      {isNeedCloseIcon && (
        <div className="absolute translate-x-[-50%] transform left-1/2 bottom-[-50px] flex md:hidden">
          <div onClick={onClose} className="flex justify-end h-full">
            {!!onClose &&
              (!!customCloseIcon ? (
                customCloseIcon
              ) : (
                <ImageComponent
                  src="/icons/close-icon.svg"
                  width={24}
                  height={24}
                  alt="close-icon-modal-mobile"
                />
              ))}
          </div>
        </div>
      )}
    </Modal>
  );
};
