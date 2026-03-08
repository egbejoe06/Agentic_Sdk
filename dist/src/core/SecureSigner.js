export class SecureSigner {
    keypair;
    constructor(keypair) {
        this.keypair = keypair;
    }
    sign(transaction) {
        transaction.partialSign(this.keypair);
    }
}
