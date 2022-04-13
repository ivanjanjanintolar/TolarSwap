import { web3 } from "./Web3Helper";

export function short(string) {
  const arr = [];

  for (let i = 2; i < string.length - 8; i++) {
    arr.push(string[i]);
  }

  return "0x" + arr.join("");
}

export function long(string) {
  const arr = [];

var sha3x1 = web3.utils.sha3(string).toString()
var sha3x2 = web3.utils.sha3(sha3x1).toString()



  for (let i = 2; i < string.length; i++) {
    arr.push(string[i]);
  }

  for  (let k = sha3x2.length-8; k < sha3x2.length; k++) {
    arr.push(sha3x2[k]);
  }

  return "54" + arr.join("");
}