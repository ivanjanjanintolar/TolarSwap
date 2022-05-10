import { web3 , RouterAddress} from "../../Web3Helper";
import { short } from "../../AddressCalculator";

export const checkForAllowance = async (connectedAccount) => {
    const encoded = await web3.eth.abi.encodeFunctionCall(
      {
        name: "allowance",
        type: "function",
        inputs: [
            {
              "internalType": "address",
              "name": "owner",
              "type": "address"
            },
            {
              "internalType": "address",
              "name": "spender",
              "type": "address"
            }
          ],
      },
      [
          short(connectedAccount),
          short(RouterAddress),
      ]
    );
    return encoded;
  };