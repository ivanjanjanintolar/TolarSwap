import { short } from "../../AddressCalculator";
import { web3 } from "../../Web3Helper";

export const getPair = async (addressTokenA, addressTokenB) => {
  const encoded = web3.eth.abi.encodeFunctionCall(
    {
      name: "getPair",
      type: "function",
      inputs: [
        {
          internalType: "address",
          name: "",
          type: "address",
        },
        {
          internalType: "address",
          name: "",
          type: "address",
        },
      ],
    },
    [short(addressTokenA), short(addressTokenB)]
  );

  return encoded;
};