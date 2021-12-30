import {Callback, Context, Handler} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';

import {HttpStatusCode, JsonUtils, StatusEvento} from '../../utils';

const client = new DynamoDB.DocumentClient();

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {

        let params: any = {
            TableName: process.env.TABLA_EVENTOS,
            KeyConditionExpression: 'id = :id ',
            ExpressionAttributeValues: {
                ':id': _event.codigo
            }
        };

        const resultado: any = await client.query(params).promise();

        if (resultado.Items && resultado.Items.length > 0) {
            const eventData = resultado.Items[0];
            eventData.estado = StatusEvento.PUBLISHED;

            params = {
                TableName: process.env.TABLA_EVENTOS,
                Item: eventData
            };

            await client.put(params).promise();
            callback(null, JsonUtils.getSuccess('ok', HttpStatusCode.OK));
        } else {
            callback(null, JsonUtils.getError('No se encuentra evento', HttpStatusCode.NOTFOUND));
        }

    } catch (e) {
        console.log('Error al completar evento', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al completar evento', HttpStatusCode.BADREQUEST));
    }
}
