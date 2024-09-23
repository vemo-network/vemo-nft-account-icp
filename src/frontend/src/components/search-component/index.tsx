import Search from "antd/es/input/Search";
import clsx from "clsx";
import styled from "styled-components";

const WrapInput = styled(Search)`
  .ant-input {
    height: 40px;
    background-color: #0f1934;
    padding-left: 10px;
    color: rgba(255, 255, 255, 0.6);
  }
  .ant-input:focus {
    border: none;
    box-shadow: none;
  }
  .ant-input-group-addon {
    background-color: #0f1934;
    pointer-events: none;
  }
`;

export const SearchComponent = ({
  placeholder,
  className,
  value,
  onChange,
}: {
  placeholder: string;
  className: string;
  value?: string;
  onChange: (e: any) => void;
}) => {
  return (
    <WrapInput
      placeholder={placeholder}
      className={clsx(
        "h-10 bg-grey-900 rounded-[8px] text-sub-text",
        className
      )}
      size="large"
      value={value}
      onChange={onChange}
    />
  );
};
