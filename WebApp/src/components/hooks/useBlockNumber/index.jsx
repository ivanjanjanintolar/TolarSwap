import { useEffect, useState } from "react";
import {web3} from '../../../utils/Web3Helper';

const useBlockNumber = function () {
  const [blockNumber, setBlockNumber] = useState(0)

  async function initialize() {
      const count = await web3.tolar.getBlockCount();
      setBlockNumber(count)
  }
  useEffect(() => {
    initialize();
    setInterval(initialize, 1000);
  }, []);

  return blockNumber;
};

export default useBlockNumber;