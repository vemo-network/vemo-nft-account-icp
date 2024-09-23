import { ImageComponent } from "@components/images/render-image";
import { utilsNotification } from "src/utils/notification-utils";

const CopyComponent = ({ text = "", width = 24, height = 24 }) => {
  return (
    <div
      onClick={(e) => {
        e.stopPropagation()
        navigator.clipboard.writeText(text ?? "");
        utilsNotification.success("Copied to clipboard");
      }}
    >
      <ImageComponent
        src="/icons/copy.svg"
        className="cursor-pointer"
        width={width}
        height={height}
        alt="copy-icon"
      />
    </div>
  );
};

export default CopyComponent;
