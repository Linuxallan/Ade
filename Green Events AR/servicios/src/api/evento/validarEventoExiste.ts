import {Callback, Context, Handler} from 'aws-lambda';
import {DynamoDB} from 'aws-sdk';

import {HttpStatusCode, JsonUtils} from '../../utils';

const client = new DynamoDB.DocumentClient();

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        let eventData: any = JSON.parse(_event.body);

        const response: any = await buscarEvento(eventData.id);
        if (response.Items.length > 0) {
            callback(null, JsonUtils.getError('Ya existe un evento con ese código', HttpStatusCode.CONFLICT));
        } else {
            callback(null, JsonUtils.getSuccess('ok', HttpStatusCode.OK));
        }
    } catch (e) {
        console.log('Error al consultar ticket', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al obtener ticket', HttpStatusCode.BADREQUEST));
    }
}

async function buscarEvento(id: string): Promise<any> {
    const params: any = {
        TableName: process.env.TABLA_EVENTOS,
        KeyConditionExpression: 'id = :id ',
        ExpressionAttributeValues: {
            ':id': id
        }
    };

    return await client.query(params).promise();
}
