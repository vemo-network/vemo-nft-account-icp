import { RenderChainIcon } from "@components/images/render-chain-icon";
import { ImageComponent } from "@components/images/render-image";
import { LoadingAnimation } from "@components/loading-animation";
import { ModalName, ModalType } from "@store/modal-service";
import { useQuery } from "@tanstack/react-query";
import { render } from "@testing-library/react";
import { Space, Table, Tag } from "antd";
import clsx from "clsx";
import React, { useCallback } from "react";
import { useOpenModalCreate } from "src/hooks/use-open-create-wallet";
import api from "src/services";
import { Wallet } from "src/types/smart-wallet";
import { getChainById } from "src/utils/chain.utils";
import { formattingUtils } from "src/utils/formatting-utils";
import { supportedChains } from "src/wagmi";
import styled from "styled-components";
import { useContractReads, useReadContracts } from "wagmi";

const WrapTable = styled(Table)`
  .ant-table-container {
    background-color: #2c2f37;
    padding: 16px;
    border-radius: 8px;
  }
  .ant-table {
    background-color: #2c2f37;
    border-radius: 8px;
  }

  .ant-table-thead {
    background-color: #2c2f37;
    height: 50px;
  }
  .ant-table-cell {
    background-color: transparent;
    border: none !important;
  }
  .ant-table-cell::before {
    background-color: #2c2f37;
    border: none !important;
  }
  .ant-pagination {
    display: none;
  }
  .ant-table-row {
    height: 40px;
  }
  .ant-table-row:hover {
    background: rgba(62, 70, 90, 0.5);
    cursor: pointer;
  }
`;

const columns = [
  {
    title: "Chain",
    dataIndex: "chain_id",
    key: "chain_id",
    className: "bg-grey-100 w-[37%]",
    render: (chain_id: any) => {
      const chain = getChainById(chain_id);
      return (
        <div className="flex gap-2 font-normal text-sm items-center">
          <RenderChainIcon chainId={chain_id} width={20} height={20} />
          {chain?.name}
        </div>
      );
    },
  },
  {
    title: "Owner",
    dataIndex: "owner_address",
    key: "owner",
    className: "bg-grey-100 w-1/4",
    render: (address: string) => (
      <p className="text-sm font-normal">
        {" "}
        {formattingUtils.centerEllipsizeString(address, 5, 4)}
      </p>
    ),
  },
  {
    title: "Status",
    dataIndex: "status",
    key: "status",
    render: (status: any) => (
      <p className="text-green-100 font-normal text-sm">Active</p>
    ),
  },
  {
    title: "Action",
    key: "action",
    className: "w-[12%]",
    render: () => (
      <Space size="middle">
        <a>View</a>
      </Space>
    ),
  },
];

const TBAList = ({
  wallet,
  setWallet,
}: {
  wallet: Wallet | null;
  setWallet: (wallet: Wallet) => void;
}) => {
  const isTestnet = getChainById(Number(wallet?.chain_id))?.testnet;
  const chainQuery = isTestnet
    ? supportedChains.filter((e) => !!e.testnet)
    : supportedChains.filter((e) => !e.testnet);
  const tbaChainToDeploys = chainQuery.filter(
    (e) => e.id !== Number(wallet?.chain_id)
  );
  const abi = [
    {
      inputs: [],
      name: "token",
      outputs: [
        {
          internalType: "uint256",
          name: "chainId",
          type: "uint256",
        },
        {
          internalType: "address",
          name: "tokenContract",
          type: "address",
        },
        {
          internalType: "uint256",
          name: "tokenId",
          type: "uint256",
        },
      ],
      stateMutability: "view",
      type: "function",
    },
  ];
  const call: any = tbaChainToDeploys.map((e) => {
    return {
      address: wallet?.tba_address,
      abi,
      chainId: e.id,
      functionName: "token",
      args: [],
    };
  });
  const { data: tbaWalletsOnChain, isLoading } = useReadContracts({
    contracts: call,
  });
  const filterData = tbaWalletsOnChain
    ?.map((e, index) => {
      return { ...e, chain_id: tbaChainToDeploys[index].id };
    })
    .filter((e) => e.status === "success")
    .map((e) => {
      return {
        ...e,
        chainId: e.chain_id,
      };
    });
  // const { data: tbaList, isLoading } = useQuery({
  //   queryKey: [
  //     "get-tba-list",
  //     wallet?.chain_id ?? 1,
  //     wallet?.contract_address ?? "0",
  //     wallet?.token_id ?? 0,
  //   ],
  //   queryFn: async () => {
  //     const subquery = `{ wallets( filter: { owner: { equalTo: \"0x0000000000000000000000000000000000000000\" }, tokenId: { equalTo: \"${
  //       wallet?.token_id
  //     }\" },chainId: { equalTo: ${Number(
  //       wallet?.chain_id
  //     )} },nftCollection: { equalTo: \"${wallet?.contract_address?.toLowerCase()}\" }  } ) { nodes { id blockHeight nftCollection tokenId owner chainId } } }`;
  //     const res = await Promise.allSettled(
  //       tbaChainToDeploys.map(async (e) => {
  //         const data = await api.WalletService.executeSubQuery({
  //           subquery: subquery,
  //           chain_id: e.id,
  //         });
  //         return {
  //           data,
  //           chainIdClone: e.id,
  //         };
  //       })
  //     );
  //     const response = res
  //       .filter((res) => res.status === "fulfilled")
  //       .flatMap(
  //         (res) =>
  //           res.value?.data?.wallets?.nodes?.map((e) => {
  //             return {
  //               ...e,
  //               chainId: res?.value?.chainIdClone,
  //             };
  //           }) || []
  //       );
  //     return response;
  //   },
  //   enabled: !!wallet,
  // });
  const newList: any = filterData?.map((e) => {
    return {
      ...wallet,
      chain_id: e.chainId,
    };
  });
  const allTba =
    newList?.length && wallet ? [wallet].concat(newList) : [wallet];
  const { onOpenModal } = useOpenModalCreate();
  const onClone = useCallback(() => {
    onOpenModal(
      () => null,
      {
        wallet,
      },
      ModalName.CLONE_WALLET,
      ModalType.CREATE
    );
  }, [wallet]);
  const isDelegate = wallet?.wallet_collection?.isDelegated;
  return (
    <div className="w-full ">
      <p className=" text-lg font-medium py-3">TBA Wallets</p>
      {isLoading ? (
        <div className="flex w-full justify-center items-center min-h-[170px]">
          <LoadingAnimation />
        </div>
      ) : (
        <>
          {!!allTba[0] ? (
            <WrapTable
              columns={columns}
              dataSource={allTba as any}
              className="bg-grey-100 rounded-[8px]"
              onRow={(data: any) => {
                return {
                  onClick: () => {
                    wallet && setWallet({ ...wallet, tbaChain: data.chain_id });
                  },
                };
              }}
              footer={() => (
                <div className="bg-grey-100 px-4 py-2">
                  <div
                    className={clsx(
                      "flex text-sm gap-2 items-center px-2 py-1 border-[1px] border-primary-100 rounded-md w-fit cursor-pointer",
                      isDelegate ? "invisible" : "visible"
                    )}
                    onClick={onClone}
                  >
                    <ImageComponent
                      src="/icons/plus.svg"
                      width={16}
                      height={16}
                      alt="deploy-btn"
                    />
                    Deploy wallet
                  </div>
                </div>
              )}
            />
          ) : null}
        </>
      )}
    </div>
  );
};

export default TBAList;
