import clx from "clsx";
import React from "react";
import { Link } from "react-router-dom";
import "./index.css";
import { ImageComponent } from "@components/images/render-image";
import Breadcrumb from "antd/es/breadcrumb/Breadcrumb";

interface BreadCrumbData
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  title?: string;
  icon?: React.ReactNode;
  path?: string;
  itemStyle?: string;
  isExternal?: boolean;
}

interface Props
  extends React.DetailedHTMLProps<
    React.ButtonHTMLAttributes<HTMLButtonElement>,
    HTMLButtonElement
  > {
  separator?: "default" | "next-white" | "next-black" | "slash" | "colon";
  separatorStyle?: string;
  to?: string;
  data?: BreadCrumbData[];
}

const BreadCrumbItem = ({
  title,
  path,
  icon,
  itemStyle,
  isExternal = false,
}: BreadCrumbData) => {
  const renderLink = () => {
    if (isExternal) {
      return (
        <div onClick={() => window.open(path)} className="cursor-pointer">
          {icon}
          <span className={clx("text-slate-600", itemStyle)}>{title}</span>
        </div>
      );
    }
    return (
      <Link to={path ?? ""}>
        {icon}
        <span className={clx("text-slate-600", itemStyle)}>{title}</span>
      </Link>
    );
  };
  return (
    <div>
      {path !== "" ? (
        renderLink()
      ) : (
        <span
          className={clx(
            "opacity-70 text-strong-gray-100 font-urbanist",
            itemStyle
          )}
        >
          {icon}
          {title}
        </span>
      )}
    </div>
  );
};

export const BreadCrumb: React.FC<Props> = ({
  separator,
  data,
  className,
  separatorStyle,
}) => {
  function getSeparator(itemStyle?: string) {
    if (separator === "next-white") {
      return (
        <div className={`flex justify-center items-center`}>
          <ImageComponent
            className={clx("w-4 h-4 !text-slate-600", itemStyle)}
            src="/icons/chevron-right-icon.svg"
            width={16}
            height={16}
            alt="chevron-right-icon"
          />
        </div>
      );
    }
    if (separator === "next-black" && separatorStyle === "black") {
      return (
        <div className={`flex justify-center items-center`}>
          {" "}
          <ImageComponent
            className={clx("w-4 h-4 !text-slate-600", itemStyle)}
            src="/icons/chevron-right-icon.svg"
            width={16}
            height={16}
            alt="chevron-right-icon"
          />
        </div>
      );
    }
    if (separator === "slash") {
      return <div className={clx("", separatorStyle, itemStyle)}>/</div>;
    }
    if (separator === "colon") {
      return <div className={clx("", separatorStyle, itemStyle)}>:</div>;
    }
    return <div className={clx("", separatorStyle, itemStyle)}>/</div>;
  }
  return (
    <div className={clx("flex items-center", className)}>
      <Breadcrumb separator="">
        {data?.map((item, index) => (
          <React.Fragment key={index}>
            <Breadcrumb.Item key={item.title}>
              <BreadCrumbItem
                itemStyle={clx(item?.itemStyle)}
                title={item?.title}
                path={item?.path}
                isExternal={(item as any)?.isExternal}
              />
            </Breadcrumb.Item>
            {index < data?.length - 1 && data?.length > 1 ? (
              <Breadcrumb.Separator key={item.title}>
                {getSeparator(item?.itemStyle)}
              </Breadcrumb.Separator>
            ) : (
              <></>
            )}
          </React.Fragment>
        ))}
      </Breadcrumb>
    </div>
  );
};
