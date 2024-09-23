import { BreadCrumb } from "@components/bread-crump";
import { useQuery } from "@tanstack/react-query";
import { useAuthSaga } from "src/hooks/use-auth";
import { useSearchWallet } from "src/hooks/use-search-wallet";
import { useAllWallets } from "src/hooks/use-wallet";
// import api from "src/services";
import { CreateWallet } from "./components/create-wallet";
import { MyWallet } from "./components/my-wallet";

const breadCrumbData = [
  {
    title: "Home",
    path: "https://vemo.network/",
    itemStyle: "!text-xs",
    isExternal: true,
  },
  {
    title: "Smart Wallet",
    path: "/",
    itemStyle: "!text-white !text-xs",
  },
];

export const Point = () => {
  const { smartWallets, refetch, isLoading, allWallets, loadingAllWallet } =
    useAllWallets();
  return (
    <section className="container mx-auto  px-0 relative h-[900px]">
      {/* <Account/> */}
      {/* <BreadCrumb
        className="text-[15px] tracking-[0.0075rem] pt-[13px] grid-screen "
        separator="next-white"
        data={breadCrumbData}
      /> */}
      {/* <div className="flex justify-between items-center py-3 ">
        <h1 className="text-2xl font-semibold">Smart Wallet</h1>
        <CreateWallet callback={refetch} />
      </div> */}

      <div className="container rounded-[8px] flex gap-6 max-w-[600px] mt-16 relative justify-center">
        <div className="w-full h-full bg-[#FFFFFF] absolute opacity-5 flex rounded-[8px]"></div>

        <MyWallet
          callback={refetch}
          smartWallets={smartWallets}
          isLoading={isLoading}
          allWallets={allWallets}
          loadingAllWallet={loadingAllWallet}
        />
      </div>
    </section>
  );
};
