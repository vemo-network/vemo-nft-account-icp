import Lottie from "lottie-react";
import React from "react";
import loadingAnim from "./loading-anim-1.json";

interface Props {
  // TODO: more types
  type?: "dots";
  width?: string | number;
  backgroundColor?: string;
  loadingContent?: string;
}

export const LoadingAnimation: React.FC<Props> = ({
  type = "dots",
  loadingContent = "",
}) => {
  const anim = React.useMemo(() => {
    return loadingAnim;
  }, [type]);

  return (
    <>
      <Lottie loop animationData={anim} />
    </>
  );
};
