"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.isTransferSolIntent = isTransferSolIntent;
exports.buildTransferSolInstruction = buildTransferSolInstruction;
const web3_js_1 = require("@solana/web3.js");
function isTransferSolIntent(intent) {
    return intent.type === "transfer_sol";
}
/** Build a SystemProgram.transfer instruction from the intent. */
function buildTransferSolInstruction(fromPubkey, intent) {
    return web3_js_1.SystemProgram.transfer({
        fromPubkey,
        toPubkey: new web3_js_1.PublicKey(intent.to),
        lamports: intent.amount * 1e9, // Convert SOL to lamports
    });
}
