import Select from "antd/es/select";
import React from "react";
import styled from "styled-components";

const WrapSelect = styled(Select)`
  .ant-select-selector {
    background: #2c2f37;
    border-radius: 8px;
  }
`;

export const SelectChainComponent = ({ handleChange, options }: any) => {
  return (
    <WrapSelect
      defaultValue="lucy"
      onChange={handleChange}
      options={options}
      className="h-10 !bg-grey-100 w-full px-[10px] rounded-[8px]"
    />
  );
};
