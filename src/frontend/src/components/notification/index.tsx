import { ImageComponent } from "@components/images/render-image";

export const BaseNotiData = {
  success: {
    icon: (
      <ImageComponent
        src={"/icons/status/success.svg"}
        width={40}
        height={40}
        alt="success"
      />
    ),
    title: <span className="text-white font-bold pl-4">Success</span>,
    className: "!bg-bluish-green-500 text-white w-400 flex gap-12",
    description: (event: string) => (
      <span className="text-sm pl-4">{event}</span>
    ),
  },
  warning: {
    icon: (
      <ImageComponent
        src={"/icons/status/warning.svg"}
        width={40}
        height={40}
        alt="warning"
      />
    ),
    title: <span className="text-pastel-red font-bold pl-4">Warning</span>,
    className: "!bg-melon-600 text-pastel-red w-400 flex gap-12",
    description: (event: string) => (
      <span className="text-sm pl-4">{event}</span>
    ),
  },
  error: {
    icon: (
      <ImageComponent
        src={"/icons/status/error.svg"}
        width={40}
        height={40}
        alt="error"
      />
    ),
    title: <span className="text-white font-bold pl-4">Error</span>,
    className: "!bg-light-maroon text-white w-400",
    description: (event: string) => (
      <span className="text-sm pl-4">{event}</span>
    ),
  },
};
