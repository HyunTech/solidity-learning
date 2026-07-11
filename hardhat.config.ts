import { HardhatUserConfig } from "hardhat/config";
import "@nomicfoundation/hardhat-toolbox";
import "@nomiclabs/hardhat-vyper";

const kairosPrivateKey =
  "0x9444f06fdf158aaa27253fcff35d61cea353650e21ffca6e95d192e3ec81d989";

const config: HardhatUserConfig = {
  solidity: "0.8.28",
  vyper: {
    version: "0.3.0",
  },
  networks: {
    kairos: {
      url: "https://public-en-kairos.node.kaia.io",
      chainId: 1001,
      accounts: [kairosPrivateKey],
    },
  },
  etherscan: {
    apiKey: {
      kairos: "unnecessary",
    },
    customChains: [
      {
        network: "kairos",
        chainId: 1001,
        urls: {
          apiURL: "https://compiler-api-v2.kaiascan.io/kairos/hardhat-verify",
          browserURL: "https://kairos.kaiascan.io",
        },
      },
    ],
  },
};

export default config;
