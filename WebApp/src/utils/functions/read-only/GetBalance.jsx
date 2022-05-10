import { short } from "../../AddressCalculator";
import { web3 } from "../../Web3Helper";

export const getBalance = async (connectedAccount) => {

  const encoded = web3.eth.abi.encodeFunctionCall(
    {
      name: "balanceOf",
      type: "function",
      inputs: [
        {
          internalType: "address",
          name: "account",
          type: "address",
        },
      ],
    },
    [short(connectedAccount)]
  );

  return encoded;
};