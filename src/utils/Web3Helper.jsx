import { REACT_APP_TOLAR_GATEWAY } from "./common";
const Web3 = require('@dreamfactoryhr/web3t');
export const web3 = new Web3(REACT_APP_TOLAR_GATEWAY());

export const tolar = web3.tolar;

export const zeroAddress = '54000000000000000000000000000000000000000023199e2b'

export const FactoryAddress = '5495444ce248f186c53c214c9229b06b3d2dc28e8093e5b188';                     
export const EthereumAddress = '549fc2ee2aad31ef25a7de33e302a52daa6bf5aeba453249d7';   
export const UsdcAddress = '5474ba2fe5e81081d9347bbcca90d8e90e139fcdbb10ea2120';                    
export const WTOLAddress =   '54a46ec7d64508a81af16b56292402f1ac5e508c03e3711a39';                     
export const RouterAddress = '541e7f4c5add01d879d1c0ca69ea902f7257935284c595f840';         