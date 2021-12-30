import {Callback, Context, Handler} from 'aws-lambda';
import {DynamoDB, S3} from 'aws-sdk';

import {HttpStatusCode, JsonUtils} from '../../utils';

const client = new DynamoDB.DocumentClient();
const s3 = new S3();

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {

        let params: any = {
            TableName: process.env.TABLA_EVENTOS,
            KeyConditionExpression: 'id = :id ',
            ExpressionAttributeValues: {
                ':id': _event.pathParameters.id
            }
        };

        const resultado: any = await client.query(params).promise();

        if (resultado.Items && resultado.Items.length > 0) {
            const evento: any = resultado.Items[0];

            const params = {
                Bucket: process.env.BUCKET,
                Key: `${evento.keyHeader}`,
                Expires: 60 * 60,
            };

            evento.urlHeader = await s3.getSignedUrlPromise('getObject', params);

            callback(null, JsonUtils.getSuccess(evento, HttpStatusCode.OK));
        } else {
            callback(null, JsonUtils.getError('No se encuentra evento', HttpStatusCode.NOTFOUND));
        }

    } catch (e) {
        console.log('Error al completar evento', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al completar evento', HttpStatusCode.BADREQUEST));
    }
}
