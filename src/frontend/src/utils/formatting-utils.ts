import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import { serializeError } from "eth-rpc-errors";
import { formatUnits, parseUnits } from "ethers6";
import { jwtDecode } from "jwt-decode";
import pluralize from "pluralize";
import { FORMAT_UTC } from "src/configs/constants/time";

dayjs.extend(utc);

export const formattingUtils = {
  centerEllipsizeString: (
    input?: string | null,
    firstNumberChars = 5,
    lastNumberChart = 14
  ) => {
    if (!input) return "";
    if (input.length < 10) return input;
    return `${input.substring(0, firstNumberChars)}...${
      lastNumberChart > 0 ? input.slice(0 - lastNumberChart) : ""
    }`;
  },

  pluralizeString: (inputStr: string, count: number) => {
    if (!inputStr) {
      return "";
    }
    return pluralize(inputStr, count);
  },

  pad: (num: number) => {
    return num < 10 && num > 0 ? `0${num}` : num;
  },

  // toFixed: (value?: BigInt, decimal = 5) => {
  //   if (!value) return "";
  //   let remainder = value.mod(Number(`1e1${decimal}`));

  //   return utils.formatEther(value.sub(remainder));
  // },
  toLocalString: (value: string | number, toFixed = 5) => {
    const decimals = Number(value) > 1 ? 2 : toFixed;
    if (!value || parseFloat(value.toString()) == 0) return "0";
    let parts = value.toString().split(".");
    const leftDecimal = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    const rightDecimal = parts[1];
    const zeroNumberAfterDecimal = -Math.floor(
      Math.log10(parseFloat(value.toString())) + 1
    );
    if (zeroNumberAfterDecimal >= 4) {
      const subscript = String(zeroNumberAfterDecimal)
        .split("")
        .map((digit) => String.fromCharCode(8320 + parseInt(digit)))
        .join("");
      return `${leftDecimal}.0${subscript}${
        rightDecimal?.slice(
          zeroNumberAfterDecimal,
          zeroNumberAfterDecimal + 4
        ) || ""
      }`;
    }
    value = parseFloat(parseFloat(value.toString()).toFixed(decimals));
    parts = value.toString().split(".");
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    return parts.join(".");
  },
  formatUnit: (value: BigInt | string, unit: number = 18) => {
    if (!value || parseFloat(value.toString()) === 0) return "0";
    if (unit < 0 || !unit) unit = 0;
    const bigNumberValue =
      typeof value === "bigint" ? value : BigInt(value.toString());
    return formatUnits(bigNumberValue, unit);
  },
  parseUnit: (value: string | number, unit: number = 18) => {
    if (!value || parseFloat(value.toString()) === 0) return BigInt(0);
    if (unit < 0 || !unit) unit = 0;
    return parseUnits(value.toString(), unit);
  },
  capitalized: (value: string) => {
    return value.charAt(0).toUpperCase() + value.slice(1);
  },
};

export function parseJwt(token: string) {
  const decoded = jwtDecode(token);
  return decoded;
}

export const formatTimeStamp = (time: string) => {
  if (!time) {
    return "--";
  }
  const convertedTimestamp = dayjs.utc(time).format(FORMAT_UTC);
  return convertedTimestamp;
};

export const formatError = (err: any) => {
  let errorFormatted = serializeError(err);
  if (!!(errorFormatted?.data as any)?.originalError?.reason) {
    errorFormatted.message = (
      errorFormatted?.data as any
    )?.originalError?.reason;
  }
  return errorFormatted;
};

export const formatTimeStampToDate = (time: number, format = FORMAT_UTC) => {
  if (!time) {
    return "--";
  }
  const date = dayjs.unix(time);

  const convertedTimestamp = dayjs.utc(date).format(format);
  return convertedTimestamp;
};

export const formatTimeStampToLocalDate = (
  time: number,
  format = FORMAT_UTC
) => {
  if (!time) {
    return "--";
  }
  const date = dayjs.unix(time);

  const convertedTimestamp = dayjs.utc(date).local().format(format);
  return convertedTimestamp;
};

export const getTimeToExpired = (timestamp: number, type = "day") => {
  const dayjsTimestamp = dayjs(timestamp);
  const remainingDays = dayjsTimestamp.diff(dayjs(), type as any);
  return remainingDays;
};
