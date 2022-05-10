// SPDX-License-Identifier: MIT
pragma solidity >=0.4.22 <0.9.0;

import '@openzeppelin/contracts/token/ERC20/ERC20Detailed.sol';
import '@openzeppelin/contracts/token/ERC20/ERC20.sol';

contract USDC is ERC20Detailed, ERC20 {
     constructor () ERC20Detailed ('USD-Coin', 'USDC', 6)public {
        _mint(msg.sender, 100000000000000000000000);
    }
}