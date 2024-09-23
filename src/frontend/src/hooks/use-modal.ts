
import { RootState } from "@store/index"
import { IModalData, resetModalState, setDataModal, setModal } from "@store/modal-service"
import { useCallback, useMemo } from "react"
import { useDispatch } from "react-redux"
import { useSelector } from "react-redux"

export const useCurrentOpeningModal = () => {
  const data = useSelector((state: RootState) => state.modal)
  return useMemo(() => data, [data])
}

export const useCloseModal = () => {
  const dispatch = useDispatch()
  const onClose = useCallback(() => {
    dispatch(resetModalState())
  }, [dispatch])

  return {
    onClose,
  }
}

export const useOpenModal = () => {
  const dispatch = useDispatch()
  const onOpen = useCallback(
    (data: IModalData) => {
      dispatch(setModal(true))
      dispatch(setDataModal(data))
    },
    [dispatch]
  )

  return {
    onOpen,
  }
}
