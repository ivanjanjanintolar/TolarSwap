import store from '../../store';
import * as types from './types';
import { REACT_APP_ENVIRONMENT, REACT_APP_TOLAR_GATEWAY } from '../../../../utils/common';
import { getBalance } from '../../../../utils/functions/read-only/GetBalance';
import { checkForAllowance } from '../../../../utils/functions/read-only/CheckForAllowance';
import { EthereumAddress,UsdcAddress,WTOLAddress, FactoryAddress } from '../../../../utils/Web3Helper';
import { short, long } from '../../../../utils/AddressCalculator';
import { toast } from 'react-toastify';
import abi from 'ethereumjs-abi'

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
        store.dispatch(getLiquidity(accounts[0]));
        // store.dispatch(checkPairsExistence(accounts[0]))
        // store.dispatch(GetTransactions(accounts[0]));
    }
}

export const getBalances = (address) => async dispatch => {

    const encoded = await getBalance(address);
    const nonce = await web3.tolar.getNonce(address);

    try {
        web3.tolar.getLatestBalance(address).then(result => {
            store.dispatch({ type: types.ON_WEB3_BALANCE, payload: result.balance });
        })

       
        //Fetch wrapped tolar balance
        web3.tolar.tryCallTransaction(
          address,
          WTOLAddress,
          0,
          600000,
          1,
          encoded,
          nonce
        ).then(result => {
            const { 0: wrappedTolarBalanceResult } = web3.eth.abi.decodeParameters(
                ["uint"],
                result.output
              );
            store.dispatch({ type: types.ON_WEB3_WTOL_BALANCE, payload: wrappedTolarBalanceResult });
        });
  

        //Fetch usdc balance

        web3.tolar.tryCallTransaction(
            address,
            UsdcAddress,
            0,
            600000,
            1,
            encoded,
            nonce
          ).then(result => {

            const { 0: usdcBalanceResult } = web3.eth.abi.decodeParameters(
                ["uint"],
                result.output
              );
              store.dispatch({ type: types.ON_WEB3_USDC_BALANCE, payload: usdcBalanceResult});
          });
    
          

        //Fetch ethereum balance


        web3.tolar.tryCallTransaction(
            address,
            EthereumAddress,
            0,
            600000,
            1,
            encoded,
            nonce
          ).then(result => {

            const { 0: ethereumBalanceResult } = web3.eth.abi.decodeParameters(
                ["uint"],
                result.output
              );
              store.dispatch({ type: types.ON_WEB3_ETH_BALANCE, payload: ethereumBalanceResult });
          });
    
    } catch (err) {
        if (err.message.includes('The method \'tol_getLatestBalance\' does not exist')) {
            store.dispatch({ type: types.ON_WEB3_ACCOUNT_FAIL, payload: { err_msg: { errorType: err.code, detail: err.message }, toast_msg: 'Instalirano je više novčanika. Onemogućite Metamask i povežite se s Tolar Hashnet "Taquin" novčanikom.' } });
        }
    }
}

export const getLiquidity = (address) => async dispatch => {

  const nonce = await web3.tolar.getNonce(address);
  const allowance = await checkForAllowance(address);

 

  try {
    const pairsLength = abi.simpleEncode("allPairsLength()");
    const quoteHex = pairsLength.toString("hex");

    //FIRST TRY CALL
    web3.tolar.tryCallTransaction(
      address,
      FactoryAddress,
      0,
      600000,
      1,
      quoteHex,
      nonce
    ).then(result =>{

      //FIRST RESULT
      const { 0: quoteB } = web3.eth.abi.decodeParameters(
        ["uint"],
        result.output
      );

      //ARRAY
      
      var addressLiquidity = [];

      //FOR LOOP
      for (let i = 0; i < quoteB; i++) {

        const getPairAddress = abi.simpleEncode("allPairs(uint):(address)", i);
        const getPairAddressHex = getPairAddress.toString("hex");
  

        //SECOND TRY CALL
        web3.tolar.tryCallTransaction(
          address,
          FactoryAddress,
          0,
          600000,
          1,
          getPairAddressHex,
          nonce
        ).then(result  => {
          const { 0: addressOutput } = web3.eth.abi.decodeParameters(
            ["address"],
            result.output
          );
    
          const token0 = abi.simpleEncode("token0()");
          const token0Hex = token0.toString("hex");
    
          //THIRD TRY CALL
          web3.tolar.tryCallTransaction(
            address,
            long(addressOutput),
            0,
            600000,
            1,
            token0Hex,
            nonce
          ).then(result =>{

            const { 0: token0Address } = web3.eth.abi.decodeParameters(
              ["address"],
              result.output
            );
      
            const token1 = abi.simpleEncode("token1()");
            const token1Hex = token1.toString("hex");
      
            //FOURTH TRY CALL
            web3.tolar.tryCallTransaction(
              address,
              long(addressOutput),
              0,
              600000,
              1,
              token1Hex,
              nonce
            ).then(result =>{

              const { 0: token1Address } = web3.eth.abi.decodeParameters(
                ["address"],
                result.output
              );
        
              const getToken0Symbol = abi.simpleEncode("symbol()");
              const getToken0SymbolHex = getToken0Symbol.toString("hex");
        
              //FIFTH TRY CALL
              web3.tolar.tryCallTransaction(
                address,
                long(token0Address),
                0,
                600000,
                1,
                getToken0SymbolHex,
                nonce
              ).then(result =>{

                const { 0: tokenSymbol } = web3.eth.abi.decodeParameters(
                  ["string"],
                  result.output
                );
          
                const getToken1Symbol = abi.simpleEncode("symbol()");
                const getToken1SymbolHex = getToken1Symbol.toString("hex");
          
                //SIXTH TRY CALL
                web3.tolar.tryCallTransaction(
                  address,
                  long(token1Address),
                  0,
                  600000,
                  1,
                  getToken1SymbolHex,
                  nonce
                ).then(result =>{

                  const { 0: tokenSymbol1 } = web3.eth.abi.decodeParameters(
                    ["string"],
                    result.output
                  );
            
                  const balanceOf = abi.simpleEncode(
                    "balanceOf(address):(uint)",
                    short(address)
                  );
                  const balanceOfHex = balanceOf.toString("hex");
            
                  //SEVENTH TRY CALL
                  web3.tolar.tryCallTransaction(
                    address,
                    long(addressOutput),
                    0,
                    600000,
                    1,
                    balanceOfHex,
                    nonce
                  ).then(result =>{

                    const { 0: balanceOutput } = web3.eth.abi.decodeParameters(
                      ["uint"],
                      result.output
                    );
              
                   
              //EIGHT TRY CALL
                    web3.tolar.tryCallTransaction(
                      address,
                      long(addressOutput).toLowerCase(),
                      0,
                      600000,
                      1,
                      allowance,
                      nonce
                    ).then(result =>{

                      const { 0: resultSpendLimit } = web3.eth.abi.decodeParameters(
                        ["uint256"],
                        result.output
                      );
                
                      if (balanceOutput > 0) {
                        addressLiquidity.push({
                          addressOfThePair: addressOutput,
                          LPTokens: balanceOutput,
                          tokenASymbol: tokenSymbol,
                          tokenBSymbol: tokenSymbol1,
                          tokenAAdress: token0Address,
                          tokenBAdress: token1Address,
                          pairAddress: addressOutput,
                          spendLimit: resultSpendLimit,
                          myLPTokensBalance: balanceOutput,
                        });
                      }
                    });//EIGHT PARANTHESIS
                  });//SEVENTH PARANTHESIS
                });//SIXTH PARANTHESIS
              });//FIFTH PARANTHESIS
            });//FOURTH PARANTHESIS
          });//THIRD PARANTHESES
          
        });//SECOND PARANTHESES
      }//FOR LOOP PARANTHESES
      store.dispatch({ type: types.ON_ADDRESS_LIQUIDITY, payload: addressLiquidity });
    });//FINAL PARANTHESIS
  
  } catch (err) {
      if (err.message.includes('The method \'tol_tryCallTransaction\' does not exist')) {
          store.dispatch({ type: types.ON_WEB3_ACCOUNT_FAIL, payload: { err_msg: { errorType: err.code, detail: err.message }, toast_msg: 'Instalirano je više novčanika. Onemogućite Metamask i povežite se s Tolar Hashnet "Taquin" novčanikom.' } });
      }
  }
}


    

    

    
   