# Getting Started with Smart contracts

## Compilation

Navigate inside core or periphery directory and run :

### `truffle compile`

Compiles all the contracts and produces build folder with all the compiled json files.


# Deployment

When you will need to deploy smart contracts to the network you can do so by following the next steps :

1)- Deployment of the UniswapV2Factory

    - Navigate inside "./core/contracts/UniswapV2Factory" and uncomment line 17.

    - Once you uncomment that line input the address to receive the fees "feeToSetter = the desired address";

    - Now you can compile the smart contracts and inside "./core/build/contracts/UniswapV2Factory" file you can find the bytecode to deploy to the network.

    - Once deployed call the "INIT_CODE_PAIR_HASH" on the smart contract and save the output value to use it for deployment of Periphery smart contracts.

2)- Deployment of the Wrapped tolar

    - To deploy Wrapped tolar just navigate inside "./periphery/build/contracts/WTOL" file and take it's bytecode and deploy it to the network.

3)- Deployment of the UniswapV2Router02 

    - Once you have the return output value from calling "INIT_CODE_PAIR_HASH" navigate inside "./periphery/contracts/libraries/UniswapV2Library" and replace "hex"--> 8a17e28473c7b28727187519d32082003ac39c8233f2cf7228f9639c2d10e263 <-- "// init code hash," with your hex string.

    - Next navigate inside "./periphery/contracts/UniswapV2Router02" and uncomment lines 24 and 25.

    - Once you uncomment that lines input addresses of the factory and wrapped tolar you got inside that constructor.

    - Save the changes and run "truffle compile".

    - Once compiled you can find the bytecode inside "./periphery/build/contracts/UniswapV2Router02" file and deploy it to the network.

4)- Deploying test tokens\
    - If you want to deploy some test tokens to try out functionalities there are 2 ERC20 tokens created inside core directory called "USDC and Ethereum" just deploy their bytecode to network. It will mint to the owner 100,000 tokens each.
