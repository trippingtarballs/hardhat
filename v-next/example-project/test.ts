import hre from "@ignored/hardhat-vnext";

// To connect to a network, you need to use the
// `hre.network.connect<...>(networkName?:string, chainType?:ChainTypeT)`
// method, which returns a Promise<NetworkConnection<ChainTypeT>>.
//
// The ChainTypeT type is inferred from the chainType param, and a default one
// is used if not provided. The default chain type (i.e. both the runtime value
// and the TS type) can be configured in the hardhat config file.
//
// Plugins can extend the NetworkConnection interface and use a hook to add
// new properties to it.

// Connects to the default network, with the default chainType.
const { close } = await hre.network.connect();
await close();

// Connects to the network with the name "mainnet", with the chain type "l1"
const {} = await hre.network.connect("mainnet", "l1");

// Connects to the network with the name "op", with the chain type "optimisim"
const {} = await hre.network.connect("op", "optimism");
