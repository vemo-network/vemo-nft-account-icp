import { getAddress, Interface } from "ethers6";
import { trim } from "viem";

export const ERC6551AccountCreatedEvent = new Interface([
  "event ERC6551AccountCreated(address account, address indexed implementation, bytes32 salt, uint256 chainId, address indexed tokenContract, uint256 indexed tokenId)",
]);

const processDecodeEvent = (result: any, eventName: string) => {
  const events = result?.events ?? result?.logs;
  const eventData = events?.find((event: any) => {
    const dataLog = ERC6551AccountCreatedEvent.parseLog(event);
    if (dataLog && dataLog.name == eventName) {
      return dataLog;
    }
  });
  return ERC6551AccountCreatedEvent.parseLog(eventData);
};

export const handleERC6551AccountCreated = (result: any) => {
  // const topicHash = iface.getEventTopic("ERC6551AccountCreated");
  // return processDecodeEvent(result, topicHash);
  return processDecodeEvent(result, "ERC6551AccountCreated");
};

export const ERC721Transfer = new Interface([
  "event Transfer(address indexed , address indexed , uint256 indexed )",
]);

export const parseTransferERC721Event = (result: any) => {
  try {
    const topics = result.topics;
    const from = getAddress("0x" + topics[1].substring(26)); // Remove 24 leading zeros to get the address
    const to = getAddress("0x" + topics[2].substring(26)); // Remove 24 leading zeros to get the address
    const tokenId = BigInt(topics[3]).toString();
    return {
      from: from,
      to: to,
      token_id: tokenId,
      contract_address: result.address,
      owner_address: to,
    };
  } catch (error) {

  }
};
