import Image from "antd/es/image";
import clsx from "clsx";
import React from "react";
import { BASE_PATH } from "src/configs/constants";

interface IImageComponent {
  className?: string;
  src: string;
  alt: string;
  width: number;
  height: number;
  onClick?: any
  httpLink?: boolean; // Add http:// or https:// prefix for external links. Default is false.
}

export const ImageComponent = ({
  className,
  src,
  alt,
  width,
  height,
  httpLink = false,
  ...rest
}: IImageComponent) => {
  const imageUrl = httpLink ? src : `${BASE_PATH}${src}`
  return (
    <div className={clsx("flex", className)}>
      <Image
        src={imageUrl}
        alt={alt}
        width={width}
        height={height}
        preview={false}
        {...rest}
      />
    </div>
  );
};
