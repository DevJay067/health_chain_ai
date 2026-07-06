/*
 * SPDX-License-Identifier: Apache-2.0
 */

import {Context, Contract, Info, Returns, Transaction} from 'fabric-contract-api';
import {HealthRecord} from './models/HealthRecord';

@Info({title: 'HealthChaincode', description: 'Health Record Chaincode for Hyperledger Fabric'})
export class HealthChaincode extends Contract {

    @Transaction()
    public async initLedger(ctx: Context): Promise<void> {
        console.info('============= START : Initialize Ledger ===========');
        // Initial setup if needed
        console.info('============= END : Initialize Ledger ===========');
    }

    @Transaction()
    public async createRecord(ctx: Context, id: string, patientId: string, doctorId: string, recordHash: string, type: string): Promise<void> {
        console.info('============= START : Create Record ===========');

        const record: HealthRecord = {
            id,
            patientId,
            doctorId,
            recordHash,
            type,
            timestamp: new Date().toISOString(),
            docType: 'healthRecord',
        };

        await ctx.stub.putState(id, Buffer.from(JSON.stringify(record)));
        console.info('============= END : Create Record ===========');
    }

    @Transaction(false)
    @Returns('string')
    public async queryRecord(ctx: Context, id: string): Promise<string> {
        const recordAsBytes = await ctx.stub.getState(id);
        if (!recordAsBytes || recordAsBytes.length === 0) {
            throw new Error(`${id} does not exist`);
        }
        return recordAsBytes.toString();
    }

    @Transaction(false)
    @Returns('string')
    public async queryPatientRecords(ctx: Context, patientId: string): Promise<string> {
        const queryString = {
            selector: {
                docType: 'healthRecord',
                patientId: patientId,
            },
        };

        const iterator = await ctx.stub.getQueryResult(JSON.stringify(queryString));
        const allResults = [];
        while (true) {
            const res = await iterator.next();
            if (res.value && res.value.value.toString()) {
                allResults.push(JSON.parse(res.value.value.toString()));
            }
            if (res.done) {
                await iterator.close();
                return JSON.stringify(allResults);
            }
        }
    }

    @Transaction()
    public async grantAccess(ctx: Context, patientId: string, doctorId: string): Promise<void> {
        // In Fabric, access control is often handled via private data collections
        // or explicit permission states. This is a simplified version.
        const accessId = `ACCESS_${patientId}_${doctorId}`;
        const accessGrant = {
            patientId,
            doctorId,
            grantedAt: new Date().toISOString(),
            docType: 'accessGrant',
        };
        await ctx.stub.putState(accessId, Buffer.from(JSON.stringify(accessGrant)));
    }
}
