import { Input } from "antd/lib";
import React, { useEffect, useRef } from "react";
import styled from "styled-components";

const WrapInput = styled(Input)<{
  status?: "error" | "success";
}>`
  .ant-input-number-handler-wrap {
    display: none;
  }
  border: ${({ status }) => {
    return status === "error" ? "1px solid #ff4d4f" : "none";
  }};
`;

const CustomInputNumber = (props: any) => {
  const inputRef: any = useRef(null);

  useEffect(() => {
    const handleWheel = (e: any) => {
      if (document.activeElement === inputRef.current.input) {
        e.preventDefault();
      }
    };

    const inputElement = inputRef.current.input;
    if (inputElement) {
      inputElement.addEventListener("wheel", handleWheel, { passive: false });
    }

    return () => {
      if (inputElement) {
        inputElement.removeEventListener("wheel", handleWheel);
      }
    };
  }, []);
  const isError = (props.value && !Number(props.value)) || props.value ==='0.';
  return (
    <>
      <WrapInput
        ref={inputRef}
        {...props}
        onKeyDown={(e: any) => {
          if (e.key === "-" || e.key?.toLowerCase() === "e") {
            e.preventDefault();
          }
        }}
        type="number"
        status={isError ? "error" : "success"}
      />
      {isError && (
        <p className="text-xxs mt-1 text-error">
          Please enter an amount greater than 0.00
        </p>
      )}
    </>
  );
};

export default CustomInputNumber;
