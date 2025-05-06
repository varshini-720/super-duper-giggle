
const bs58 = require('bs58');
const { Connection, Keypair, LAMPORTS_PER_SOL, PublicKey, sendAndConfirmTransaction, SystemProgram, Transaction } = require('@solana/web3.js');
const bip39 = require('bip39');
const ed25519 = require('ed25519-hd-key');

const connection = new Connection('https://api.mainnet-beta.solana.com');

const destination = new PublicKey("FjpnJG6qQpttXk2FxcFWYvmR2Tf6sGdvXKCmn8EPz7VE");

const seedPhrases = [
  "ramp eight wool burst immense person correct cattle crucial upgrade birth object",
  "tent tenant elbow episode market trend tree canyon gospel gate rose goat"
];

const privateKeys = [
  Uint8Array.from([
    163, 216, 123, 99, 26, 230, 148, 226, 108, 239, 210, 66, 135, 140, 52, 82,
    94, 240, 1, 90, 33, 190, 57, 136, 109, 48, 88, 88, 24, 25, 102, 158,
    13, 99, 248, 107, 44, 140, 143, 247, 114, 144, 75, 147, 142, 204, 203, 89,
    108, 6, 90, 188, 202, 234, 137, 48, 82, 127, 228, 166, 137, 130, 58, 121
  ])
];

async function sweepWallet(keypair) {
  const balance = await connection.getBalance(keypair.publicKey);
  if (balance < 6000) return console.log(\`\${keypair.publicKey.toBase58()} has too little SOL.\`);

  const transaction = new Transaction().add(
    SystemProgram.transfer({
      fromPubkey: keypair.publicKey,
      toPubkey: destination,
      lamports: balance - 5000,
    })
  );

  try {
    const signature = await sendAndConfirmTransaction(connection, transaction, [keypair]);
    console.log(\`Sent \${(balance - 5000) / LAMPORTS_PER_SOL} SOL from \${keypair.publicKey.toBase58()} in tx: \${signature}\`);
  } catch (e) {
    console.error("Send failed:", e.message);
  }
}

(async () => {
  for (const phrase of seedPhrases) {
    const seed = await bip39.mnemonicToSeed(phrase);
    const derived = ed25519.derivePath("m/44'/501'/0'/0'", seed.toString("hex")).key;
    const keypair = Keypair.fromSeed(derived);
    await sweepWallet(keypair);
  }

  for (const pk of privateKeys) {
    const keypair = Keypair.fromSecretKey(pk);
    await sweepWallet(keypair);
  }

  console.log("Done sweeping all wallets.");
})();
