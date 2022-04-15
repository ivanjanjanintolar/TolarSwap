import store from '../../store';
import * as types from './types';
import { REACT_APP_ENVIRONMENT, REACT_APP_TOLAR_GATEWAY } from '../../../../utils/common';
import { getBalance } from '../../../../utils/functions/read-only/GetBalance';
import { EthereumAddress,UsdcAddress,WTOLAddress } from '../../../../utils/Web3Helper';
import { toast } from 'react-toastify';
import { checkPairsExistence } from '../pools';
const Web3 = require('@dreamfactoryhr/web3t');
var web3 = new Web3(REACT_APP_TOLAR_GATEWAY());


export const checkForWeb3 = () => async dispatch => {
    if (typeof window.tolar !== 'undefined') {
        store.dispatch({ type: types.ON_WEB3_CHECK, payload: true });
        // setupListeners();
        store.dispatch(connectWallet());
    } else {
         store.dispatch({ type: types.ON_WEB3_CHECK, payload: false });
         return
    }
}

function setupListeners() {
    window.tolar.on('accountsChanged', function (accounts) {
        // window.location.reload();
        if (accounts[0]) {handleAccountsChanged(accounts);}
    })
    // window.ethereum.on('accountsChanged', (accounts) => {
    //     console.log('accountsChanged...');
    //     handleAccountsChanged(accounts);
    // });
    // window.ethereum.on('chainChanged', (chainId) => {
    //     console.log('chainChanged...reloading page...');
    //     window.location.reload();
    // });
    // window.ethereum.on('message', (message) => {
    //     console.log(message);
    // });
}

export const connectWallet = () => async dispatch => {
    
    try {
        window.tolar
            .enable()
            .then((accounts) => {
                if ((REACT_APP_ENVIRONMENT() === 'mainnet') && (window.tolar.networkVersion !== 'mainnet')) {
                    store.dispatch({ type: types.ON_WEB3_ACCOUNT_FAIL, payload: { err_msg: { errorType: '0', detail: 'Molimo, prebacite se na mrežu MainNet' }, toast_msg: 'Prebacite Taquin Wallet na MainNet.' } });
                // } else if ((REACT_APP_ENVIRONMENT() === 'testnet') && (window.tolar.networkVersion !== 'testnet')) {
                //     store.dispatch({ type: types.ON_WEB3_ACCOUNT_FAIL, payload: { err_msg: { errorType: '0', detail: 'Molimo, prebacite se na mrežu TestNet' }, toast_msg: 'Prebacite Taquin Wallet na TestNet.' } });
                   
                // } 
                //  else if ((REACT_APP_ENVIRONMENT() === 'staging-gpc') && (window.tolar.networkVersion !== 'staging-gcp')) {
                //      store.dispatch({ type: types.ON_WEB3_ACCOUNT_FAIL, payload: { err_msg: { errorType: '0', detail: 'Molimo, prebacite se na mrežu Staging' }, toast_msg: 'Prebacite Taquin Wallet na Staging.' } });
                  }
                else {
                    handleAccountsChanged(accounts);
                    setupListeners();
                }
            })
            .catch((error) => {
                const message = error.message || "";
                if (message.match(/Already processing/i)) {
                    window.location.reload();
                }
            });
        web3 = new Web3(window.tolar);
    } catch (error) {
        toast("Please Install Taquin wallet to interact with TolarSwap :)");
        console.log(error);
    }
}

function handleAccountsChanged(accounts) {
    if (accounts.length === 0) {
        console.log('Please connect with Taquin wallet.'); // MetaMask is locked or the user has not connected any accounts
        store.dispatch({ type: types.ON_WEB3_ACCOUNT_FAIL, payload: { err_msg: { errorType: '0', detail: 'No accounts.' }, toast_msg: 'Povežite se s Taquin novčanikom.' } });
    } else if (accounts[0]) {
        store.dispatch({ type: types.ON_WEB3_ACCOUNT, payload: accounts[0] });
        store.dispatch(getBalances(accounts[0]));
        store.dispatch(checkPairsExistence(accounts[0]))
        // store.dispatch(GetTransactions(accounts[0]));
    }
}

export const getBalances = (address) => async dispatch => {

    const encoded = await getBalance(address);

    try {
        web3.tolar.getLatestBalance(address).then(result => {
            store.dispatch({ type: types.ON_WEB3_BALANCE, payload: result.balance });
        })

       
        //Fetch wrapped tolar balance
        const wrappedTolarBalance = await web3.tolar.tryCallTransaction(
          address,
          WTOLAddress,
          0,
          600000,
          1,
          encoded,
          await web3.tolar.getNonce(address)
        );
  
        const { 0: wrappedTolarBalanceResult } = web3.eth.abi.decodeParameters(
          ["uint"],
          wrappedTolarBalance.output
        );
        store.dispatch({ type: types.ON_WEB3_WTOL_BALANCE, payload: wrappedTolarBalanceResult });


        //Fetch usdc balance

        const usdcBalance = await web3.tolar.tryCallTransaction(
            address,
            UsdcAddress,
            0,
            600000,
            1,
            encoded,
            await web3.tolar.getNonce(address)
          );
    
          const { 0: usdcBalanceResult } = web3.eth.abi.decodeParameters(
            ["uint"],
            usdcBalance.output
          );
          store.dispatch({ type: types.ON_WEB3_USDC_BALANCE, payload: usdcBalanceResult });

        //Fetch ethereum balance


        const ethereumBalance = await web3.tolar.tryCallTransaction(
            address,
            EthereumAddress,
            0,
            600000,
            1,
            encoded,
            await web3.tolar.getNonce(address)
          );
    
          const { 0: ethereumBalanceResult } = web3.eth.abi.decodeParameters(
            ["uint"],
            ethereumBalance.output
          );
          store.dispatch({ type: types.ON_WEB3_ETH_BALANCE, payload: ethereumBalanceResult });



    } catch (err) {
        if (err.message.includes('The method \'tol_getLatestBalance\' does not exist')) {
            store.dispatch({ type: types.ON_WEB3_ACCOUNT_FAIL, payload: { err_msg: { errorType: err.code, detail: err.message }, toast_msg: 'Instalirano je više novčanika. Onemogućite Metamask i povežite se s Tolar Hashnet "Taquin" novčanikom.' } });
        }
    }
}