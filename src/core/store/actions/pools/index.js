import * as types from '../web3/types'
import store from '../../store';
import { getPair } from '../../../../utils/functions/read-only/GetPair';
import { WTOLAddress, UsdcAddress, EthereumAddress, FactoryAddress } from '../../../../utils/Web3Helper';
import { REACT_APP_TOLAR_GATEWAY } from '../../../../utils/common';
const Web3 = require('@dreamfactoryhr/web3t');
var web3 = new Web3(REACT_APP_TOLAR_GATEWAY());

export const checkPairsExistence = (connectedAccount) => async dispatch => {


    //GET WRAPPED TOLAR-USDC PAIR
    const get_wtol_usdc_pair= await getPair(
        WTOLAddress,
        UsdcAddress
      );
    
      const receipt_of_wtol_and_usdc = await web3.tolar.tryCallTransaction(
        connectedAccount,
        FactoryAddress,
        0,
        600000,
        1,
        get_wtol_usdc_pair,
        await web3.tolar.getNonce(connectedAccount)
      );


      const { 0: wtol_usdc_address_pair } = web3.eth.abi.decodeParameters(
        ["address"],
        receipt_of_wtol_and_usdc.output
      );

      if(wtol_usdc_address_pair !== '0x0000000000000000000000000000000000000000'){
        store.dispatch({ type: types.ON_WTOL_USDC_POOL, payload: wtol_usdc_address_pair });
      }


      //GET WRAPPED TOLAR-ETH PAIR 

      const get_wtol_eth_pair= await getPair(
        WTOLAddress,
        EthereumAddress
      );
    
      const receipt_of_wtol_and_eth = await web3.tolar.tryCallTransaction(
        connectedAccount,
        FactoryAddress,
        0,
        600000,
        1,
        get_wtol_eth_pair,
        await web3.tolar.getNonce(connectedAccount)
      );


      const { 0: wtol_eth_address_pair } = web3.eth.abi.decodeParameters(
        ["address"],
        receipt_of_wtol_and_eth.output
      );  

      if(wtol_eth_address_pair !== '0x0000000000000000000000000000000000000000'){
        store.dispatch({ type: types.ON_WTOL_ETH_POOL, payload: wtol_eth_address_pair });
      }

      //GET USDC-ETH PAIR


      
      const get_usdc_eth_pair= await getPair(
        UsdcAddress,
        EthereumAddress
      );
    
      const receipt_of_usdc_and_eth = await web3.tolar.tryCallTransaction(
        connectedAccount,
        FactoryAddress,
        0,
        600000,
        1,
        get_usdc_eth_pair,
        await web3.tolar.getNonce(connectedAccount)
      );


      const { 0: usdc_eth_address_pair } = web3.eth.abi.decodeParameters(
        ["address"],
        receipt_of_usdc_and_eth.output
      );
      
      if(usdc_eth_address_pair !== '0x0000000000000000000000000000000000000000'){
        store.dispatch({ type: types.ON_USDC_ETH_POOL, payload: usdc_eth_address_pair });
      }


    // if (typeof window.tolar !== 'undefined') {
    //     store.dispatch({ type: types.ON_WEB3_CHECK, payload: true });
    //     // setupListeners();
    //     store.dispatch(connectWallet());
    // } else {
    //      store.dispatch({ type: types.ON_WEB3_CHECK, payload: false });
    //      return
    // }
}

