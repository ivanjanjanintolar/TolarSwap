import * as types from "../../actions/web3/types";

const INITIAL_STATE = {
  wtol_usdc_pool: {
    exists: false,
    address: null,
  },
  wtol_eth_pool: {
    exists: false,
    address: null,
  },
  usdc_eth_pool: {
    exists: false,
    address: null,
  },
};

// eslint-disable-next-line import/no-anonymous-default-export
export default (state = INITIAL_STATE, action) => {
  switch (action.type) {
    //WTOL_USDC
    case types.ON_WTOL_USDC_POOL:
      return {
        wtol_usdc_pool_address: action.payload,
      };

    //WTOL_ETH
    case types.ON_WTOL_ETH_POOL:
      return {
        wtol_eth_pool_address: action.payload,
      };

    //USDC_ETH
    case types.ON_USDC_ETH_POOL:
      return {
        usdc_eth_pool_address: action.payload,
      };

    default:
      return state;
  }
};
