import { serializeError } from "eth-rpc-errors";

export const asError = (thrown: unknown): Error => {
  if (thrown instanceof Error) {
    return thrown;
  }

  let message: string;

  if (typeof thrown === "string") {
    message = thrown;
  } else {
    try {
      message = JSON.stringify(thrown);
    } catch {
      message = String(thrown);
    }
  }

  return new Error(message);
};

export const formatOnchainError = (error: any) => {
  const errorFormatted: any = serializeError(error);
  return {
    ...errorFormatted,
    message:
      errorFormatted?.data?.originalError?.reason ??
      errorFormatted?.data?.originalError?.shortMessage ??
      error.message,
  };
};
