import * as FabricCAServices from 'fabric-ca-client';
import { FileSystemWallet, X509WalletMixin } from 'fabric-network';
import { config, ccp } from '../server';
import * as path from 'path';

export default async function enrollAdmin(req, res) {
    console.log("\n/enrollAdmin");
    try {
        var appAdmin = config.appAdmin;
        var appAdminSecret = config.appAdminSecret;
        var orgMSPID = config.orgMSPID;
        var caName = config.caName;

        const caURL = ccp.certificateAuthorities[caName].url;
        const ca = new FabricCAServices(caURL);

        // Create a new file system based wallet for managing identities.
        const walletPath = path.join(process.cwd(), 'wallet');
        const wallet = new FileSystemWallet(walletPath);

        // Check to see if we've already enrolled the admin user.
        const adminExists = await wallet.exists(appAdmin);
        if (adminExists) {
            res.json({
                status: 'FAILED',
                message: `An identity for the admin user ${appAdmin} already exists in the wallet`
            })
            return;
        }

        // Enroll the admin user, and import the new identity into the wallet.
        const enrollment = await ca.enroll({ enrollmentID: appAdmin, enrollmentSecret: appAdminSecret });
        const identity = X509WalletMixin.createIdentity(orgMSPID, enrollment.certificate, enrollment.key.toBytes());
        await wallet.import(appAdmin, identity);
        res.json({
            status: 'SUCCESS',
            message: `Successfully enrolled admin user ${appAdmin} and imported it into the wallet`
        })

    } catch (error) {
        res.json({
            status: 'FAILED',
            message: `Failed to enroll admin user ${appAdmin}: ${error}` 
        })
    }
}
