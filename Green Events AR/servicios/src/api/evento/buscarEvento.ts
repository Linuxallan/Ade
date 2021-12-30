import {Callback, Context, Handler} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';

import {HttpStatusCode, JsonUtils} from '../../utils';

const client = new DynamoDB.DocumentClient();

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!_event.headers.evento) {
        callback(null, JsonUtils.getError('Evento no especificado',
            HttpStatusCode.FORBIDDEN));
    }

    try {

        let params: any = {
            TableName: process.env.TABLA_EVENTOS,
            KeyConditionExpression: 'id = :id ',
            ExpressionAttributeValues: {
                ':id': _event.headers.evento
            }
        };

        const resultado: any = await client.query(params).promise();

        if (resultado.Items && resultado.Items.length > 0) {
            const evento: any = resultado.Items[0];

            delete evento.token;
            delete evento.stackId;
            delete evento.keyHeader;
            delete evento.keyPath;
            delete evento.dominio;
            delete evento.region;

            callback(null, JsonUtils.getSuccess(evento, HttpStatusCode.OK));
        } else {
            callback(null, JsonUtils.getError('No se encuentra evento', HttpStatusCode.NOTFOUND));
        }

    } catch (e) {
        console.log('Error al completar evento', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al completar evento', HttpStatusCode.BADREQUEST));
    }
}
