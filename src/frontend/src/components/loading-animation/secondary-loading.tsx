import React from "react"
import Lottie from "lottie-react"

import loadingAnim from "./loading-anim-2.json"

interface Props {
  // TODO: more types
  type?: "dots"
  width?: string | number
  backgroundColor?: string
}

export const SecondaryLoadingAnimation: React.FC<Props> = ({ type = "dots" }) => {
  const anim = React.useMemo(() => {
    return loadingAnim
  }, [type])

  return <Lottie loop animationData={anim} />
}
