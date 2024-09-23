import Select, { BaseOptionType } from "antd/lib/select";
import clsx from "clsx";
import { CustomTagProps } from "rc-select/lib/BaseSelect";
import React, {
  JSXElementConstructor,
  ReactElement,
  ReactNode,
  useEffect,
  useRef,
} from "react";
import "./index.css";
import { ImageComponent } from "@components/images/render-image";
import { EmptyState } from "@components/state/empty-state";
import { SelectProps } from "antd/es/select";
import Tag from "antd/es/tag";
import styled from "styled-components";

const { Option } = Select;

type SelectOptionType = {
  label: string | number | React.ReactNode;
  value: string | number;
};

type SelectValueType =
  | SelectOptionType[]
  | SelectOptionType
  | string[]
  | string
  | number[]
  | number;

export interface SelectAntdProps {
  size?: "small" | "middle" | "large";
  mode?: "multiple";
  bgfill?: "tungsten" | "marine-blue" | "dark-blue" | "grey" | "dark";
  optionsData: SelectOptionType[] | string[];
  defaultValue?: SelectValueType;
  value?: SelectValueType;
  placeholder?: string;
  optionsProps?: { disabled?: boolean }[];
  onChange?: (value: any) => void;
  className?: string;
  open?: boolean;
  disabled?: boolean;
  allowClear?: boolean;
  labelInValue?: boolean; // if labelInValue = true, when selected it will return an object e:{label, value, key, disable}
  error?: string;
  dropdownRender?: (
    menu?: any
  ) => ReactElement<any, string | JSXElementConstructor<any>>;
  showArrow?: boolean;
  textColor?: "navy" | "gray";
  onPopupScroll?: React.UIEventHandler<HTMLDivElement>;
  onSelect?: any;
  showSearch?: boolean;
  filterOption?: any;
  width?: string;
  emptyState?: any;
  onSearch?: (value: any) => void;
  onBlur?: any;
}

export const SelectComponent: React.FC<SelectAntdProps> = (props) => {
  const getBgFill = () => {
    if (props?.bgfill === "dark-blue")
      return {
        container: "dark-blue-container",
        optionContainer: "dark-blue-option",
      };
    if (props?.bgfill === "grey")
      return { container: "grey-container", optionContainer: "grey-option" };
    if (props?.bgfill === "dark")
      return { container: "dark-container", optionContainer: "dark-option" };
    if (props?.bgfill === "tungsten")
      return {
        container: "tungsten-container",
        optionContainer: "tungsten-option",
      };
    return {
      container: "dark-blue-container",
      optionContainer: "dark-blue-option",
    };
  };

  function getSize() {
    switch (props?.size) {
      case "small":
        return "!py-1";
      case "middle":
        return "!py-2 rounded-lg";
      case "large":
        return "!py-3";
      default:
        return "!py-2 rounded-lg";
    }
  }
  return (
    <BaseSelect
      {...props}
      placeholder={props?.placeholder ?? "Please select"}
      className={clsx(
        "text-grey-blue w-full flex items-center",
        props?.className,
        getSize(),
        !!props?.error && "border border-red-600",
        props?.disabled ? "opacity-50 selector-disable" : ""
      )}
      tagClassName="!bg-cerulean-blue !border-cerulean-blue !text-white !rounded !text-sm"
      popupClassName={clsx(
        getBgFill()?.optionContainer,
        props?.width ? "!w-[300px]" : ""
      )}
      containerClassName={clsx(getBgFill()?.container)}
      closeIcon={
        <ImageComponent
          src="/icons/chevron-down-icon.svg"
          width={18}
          height={18}
          alt="chevron-right-icon"
          className="absolute -top-1.5 -right-1.5"
        />
      }
      variant="filled"
    />
  );
};

interface Props extends SelectProps {
  optionsData: SelectOptionType[] | string[];
  closeIcon?: ReactNode;
  tagClassName?: string;
  optionsProps?: BaseOptionType[];
  bgfill?: "tungsten" | "marine-blue" | "dark-blue" | "grey" | "dark";
  containerClassName?: string;
  emptyState?: any;
  onBlur?: any;
}

const WrapSelect = styled(Select)`
  .ant-select-item-empty {
    background-color: red;
  }
  .ant-select-arrow {
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
  }
  .default-icon,
  .search-icon {
    transition: opacity 0.3s;
    position: absolute;
    left: -18px;
    top: -15px;
  }

  .default-icon {
    opacity: 1;
  }

  .search-icon {
    opacity: 0;
  }

  &.ant-select-open .default-icon {
    opacity: 0;
  }

  &.ant-select-open .search-icon {
    opacity: 1;
  }
  .dark-blue-option {
    width: 300px !important;
  }
`;

const BaseSelect: React.FC<Props> = ({
  optionsData,
  closeIcon,
  tagClassName,
  optionsProps,
  containerClassName,
  emptyState,
  ...props
}) => {
  function getColorSuffixIcon() {
    if (props?.bgfill === "dark-blue") return "text-grey-blue";
    if (props?.bgfill === "tungsten") return "text-grey-650";
    return "text-grey-650";
  }
  const renderSelect = () => {
    if (props.showSearch) {
      return (
        <WrapSelect
          id="select"
          {...props}
          suffixIcon={
            <>
              <ImageComponent
                className={clsx("pb-[50%] default-icon", getColorSuffixIcon())}
                src="/icons/chevron-down-icon.svg"
                width={18}
                height={18}
                alt="chevron-right-icon"
              />
              <ImageComponent
                className={clsx("pb-[50%] search-icon", getColorSuffixIcon())}
                src="/icons/search-icon.svg"
                width={18}
                height={18}
                alt="chevron-right-icon"
              />
            </>
          }
          tagRender={(props) => (
            <TagRender
              props={props}
              className={tagClassName ?? ""}
              closeIcon={closeIcon}
            />
          )}
          notFoundContent={emptyState}
        >
          {optionsData?.map((item: any, idx) => (
            <Option
              key={idx}
              {...optionsProps?.[idx]}
              value={item?.value}
              style={{
                color: "inherit",
              }}
            >
              {item?.label}
            </Option>
          ))}
        </WrapSelect>
      );
    }
    return (
      <Select
        {...props}
        suffixIcon={
          <>
            <ImageComponent
              className={clsx("pb-[50%] default-icon", getColorSuffixIcon())}
              src="/icons/chevron-down-icon.svg"
              width={18}
              height={18}
              alt="chevron-right-icon"
            />
          </>
        }
        tagRender={(props) => (
          <TagRender
            props={props}
            className={tagClassName ?? ""}
            closeIcon={closeIcon}
          />
        )}
        notFoundContent={
          <div className="flex justify-center items-center py-4">
            <EmptyState title="No results found." />
          </div>
        }
      >
        {optionsData?.map((item: any, idx) => (
          <Option
            key={idx}
            {...optionsProps?.[idx]}
            value={item?.value}
            style={{
              color: "inherit",
            }}
          >
            {item?.label}
          </Option>
        ))}
      </Select>
    );
  };
  return <div className={clsx(containerClassName)}>{renderSelect()}</div>;
};

const TagRender = ({
  props,
  className,
  closeIcon,
}: {
  props: CustomTagProps;
  className: string;
  closeIcon: ReactNode;
}) => {
  const { label, closable, onClose } = props;

  const onPreventMouseDown = (event: any) => {
    event.preventDefault();
    event.stopPropagation();
  };

  return (
    <Tag
      onMouseDown={onPreventMouseDown}
      closable={closable}
      onClose={onClose}
      className={clsx("tag", className)}
      closeIcon={closeIcon}
    >
      {label}
    </Tag>
  );
};
