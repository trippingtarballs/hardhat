import hre from "@ignored/hardhat-vnext";

async function runExample(networkName: string) {
  console.log("Running example for network", networkName);

  const { viem } = await hre.network.connect(networkName, "optimism");

  const client = await viem.getPublicClient();
  console.log(
    await client.getBalance({
      // OP WETH
      address: "0x4200000000000000000000000000000000000006",
    }),
  );

  const latestBlock = await client.getBlock();

  console.log("Last L2 base fee:", latestBlock.baseFeePerGas);
  console.log("L1 base fee:", await client.getL1BaseFee());
  console.log();
}

await runExample("op");
await runExample("edrOp");
