import { ReactNode } from "react"
import { useSelector } from "react-redux"
import Modal from "antd/lib/modal"
import { CustomLoading } from "../loading-animation/custom-loading"
import "./loading-overlay.css"
import { RootState } from "@store/index"
import { SecondaryLoadingAnimation } from "@components/loading-animation/secondary-loading"

interface Props {
  children?: ReactNode
}

export default function LoadingOverlay({ children }: Props) {
  const { isLoading } = useSelector((state: RootState) => state.ui)

  return (
    isLoading && (
      <Modal
        open={isLoading}
        centered
        className="!bg-transparent loading-overlay w-full"
        wrapClassName="loading-modal"
        footer={null}
        closeIcon={<></>}
      >
        <div className="flex flex-col items-center justify-end w-full h-full -mt-16 space-y-4 text-white">
          {/* <CustomLoading /> */}
          <SecondaryLoadingAnimation/>
          {/* TODO: Can be update after  */}
          {/* <p className="text-[0.875rem] h-[1.375rem] tracking-[0.0175rem]">Loading...</p> */}
        </div>
      </Modal>
    )
  )
}
