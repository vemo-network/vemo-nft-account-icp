// src/utils/parseTransferERC721Event.test.ts
import { describe, expect, it } from "vitest";
import { parseTransferERC721Event } from "../handle-event.utils";

describe("parseTransferERC721Event", () => {
  it("should correctly parse the ERC721 transfer event", () => {
    // Mock result input, assuming ERC721Transfer.parseLog(result) is correctly mocked
    const mockResult = {
      address: "0x604873f647c6888c109e9fb28ea32de82d97806a",
      topics: [
        "0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef",
        "0x0000000000000000000000000000000000000000000000000000000000000000",
        "0x0000000000000000000000005793915cb8a39afb03ddc807122cf2935e9c9298",
        "0x0000000000000000000000000000000000000000000000000000000000000011",
      ],
      data: "0x",
      blockNumber: "0xea5e400",
      blockHash:
        "0x83bfb6e569934b2274fb4f5ad82e7b956b2d904f2f589a8878f432c527490466",
      timeStamp: "0x66c80c43",
      gasPrice: "0x989680",
      gasUsed: "0x51b33",
      logIndex: "0x",
      transactionHash:
        "0xbac0ad4209eda5a3243a5db91ba3c784f7d964d095b5637f71761b9fa4ef18a1",
      transactionIndex: "0x1",
    };

    // Mocking the ERC721Transfer.parseLog method
    const ERC721Transfer = {
      parseLog: jest.fn().mockReturnValue(mockResult.data),
    };

    const result = parseTransferERC721Event(mockResult);

    expect(result).toEqual({
      from: "0xFromAddress",
      to: "0xToAddress",
      token_id: "12345",
      contract_address: "0xContractAddress",
      owner_address: "0xToAddress",
    });
  });

  it("should handle null data gracefully", () => {
    const mockResult = {
      address: "0xContractAddress",
      // Simulate no data being parsed
      data: null,
    };

    // Mocking the ERC721Transfer.parseLog method
    const ERC721Transfer = {
      parseLog: jest.fn().mockReturnValue(null),
    };

    const result = parseTransferERC721Event(mockResult);

    expect(result).toEqual({
      from: undefined,
      to: undefined,
      token_id: undefined,
      contract_address: "0xContractAddress",
      owner_address: undefined,
    });
  });
});
