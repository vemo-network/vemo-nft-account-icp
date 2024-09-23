import { useSmartWallet } from "@context/smart-wallet-context";

export const usePlatforms = () => {
  const data = useSmartWallet();
  return data?.platforms.filter(e => !!e?.usecases?.length);
};
