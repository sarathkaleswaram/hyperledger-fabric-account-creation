
import { FileSystemWallet, Gateway, X509WalletMixin } from 'fabric-network';
import * as path from 'path';
import { config, ccpPath } from '../server';

export default async function registerUser(req, res) {
    console.log("\n/registerUser");
    try {
        var appAdmin = config.appAdmin;
        var orgMSPID = config.orgMSPID;
        var gatewayDiscovery = config.gatewayDiscovery;

        var user = config.user;

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the enrollmentID.
        const userExists = await wallet.exists(user);
        if (userExists) {
            res.json({
                status: 'FAILED',
                message: `An identity for the enrollmentID ${user} already exists in the wallet`
            })
            return;
        }

        // Check to see if we've already enrolled the app-admin enrollmentID.
        const adminExists = await wallet.exists(appAdmin);
        if (!adminExists) {
            console.log('Run the enrollAdmin.ts application before retrying')
            res.json({
                status: 'FAILED',
                message: `An identity for the admin enrollmentID ${appAdmin} does not exist in the wallet`
            })
            return;
        }

        // Create a new gateway for connecting to our peer node.
        const gateway = new Gateway();
        await gateway.connect(ccpPath, { wallet, identity: appAdmin, discovery: gatewayDiscovery });

        // Get the CA client object from the gateway for interacting with the CA.
        const ca = gateway.getClient().getCertificateAuthority();
        const adminIdentity = gateway.getCurrentIdentity();

        // Register the enrollmentID, enroll the enrollmentID, and import the new identity into the wallet.
        const secret = await ca.register({ affiliation: 'org1.department1', enrollmentID: user, role: 'client' }, adminIdentity);
        const enrollment = await ca.enroll({ enrollmentID: user, enrollmentSecret: secret });
        const userIdentity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(user, userIdentity);

        res.json({
            status: 'SUCCESS',
            message: `Successfully registered and enrolled user with name ${user} and imported it into the wallet`
        })
    } catch (error) {
        res.json({
            status: 'FAILED',
            message: `Failed to register enrollmentID ${user}: ${error}`
        })
    }
}
