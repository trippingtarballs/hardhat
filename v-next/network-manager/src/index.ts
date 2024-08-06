import type { HardhatPlugin } from "@ignored/hardhat-vnext/types/plugins";

import "./type-extensions.js";
import { ArgumentType, globalOption } from "@ignored/hardhat-vnext/config";

const networkManagerPlugin: HardhatPlugin = {
  id: "network-manager",
  hookHandlers: {
    config: import.meta.resolve("./hooks/config.js"),
    hre: import.meta.resolve("./hooks/hre.js"),
    network: import.meta.resolve("./hooks/network.js"),
  },
  globalOptions: [
    globalOption({
      name: "network",
      description: "The network to connect to",
      type: ArgumentType.STRING,
      defaultValue: "",
    }),
  ],
};

export default networkManagerPlugin;
