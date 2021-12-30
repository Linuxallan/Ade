import {Callback, Context, Handler} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';
import {tz} from 'moment-timezone';

import {HttpStatusCode, JsonUtils} from '../../utils';

const client = new DynamoDB.DocumentClient();

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const params: any = {
            TableName: process.env.TABLA_EVENTOS,
            ProjectionExpression: 'id, titulo, fecha, estado'
        };

        const result: any = await client.scan(params).promise();
        result.Items.sort((it1: any, it2: any) => it1.fecha > it2.fecha ? 1 : -1);

        for (const item of result.Items) {
            item.fecha = tz(item.fecha, 'YYYY-MM-DD:HH:mm:ss').format('DD/MM/YYYY');
        }

        console.log(result);

        callback(null, JsonUtils.getSuccess(result.Items, HttpStatusCode.OK));
    } catch (e) {
        console.log('Error al listar eventos', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al listar eventos', HttpStatusCode.BADREQUEST));
    }
}
