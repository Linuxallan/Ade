import {Callback, Context, Handler} from 'aws-lambda';
import {HttpStatusCode, JsonUtils, StatusEvento} from '../../utils';

import {CloudFormation, DynamoDB, S3} from 'aws-sdk';
import {tz} from 'moment-timezone';

const client = new DynamoDB.DocumentClient();

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

            await eliminarObjetos(evento);
            await eliminarStack(evento);

            const hoy = tz('America/Santiago');
            evento.fechaTermino = hoy.format('YYYY-MM-DD:HH:mm:ss');

            evento.estado = StatusEvento.FINISHED;

            const params: any = {
                TableName: process.env.TABLA_EVENTOS,
                Item: evento
            };

            await client.put(params).promise();

            callback(null, JsonUtils.getSuccess('ok', HttpStatusCode.OK));
        } else {
            callback(null, JsonUtils.getError('No se encuentra evento', HttpStatusCode.NOTFOUND));
        }


    } catch (e) {
        console.log('Error al eliminar evento', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al crear evento', HttpStatusCode.BADREQUEST));
    }
}

/**
 * Elimina todos los objetos del bucket del sitio del evento.
 *
 * @param evento
 */
async function eliminarObjetos(evento: any): Promise<void> {
    const s3 = new S3({region: evento.region});

    const {Contents} = await s3.listObjects({Bucket: `${evento.id}-${process.env.STAGE}`}).promise();
    if (Contents && Contents.length > 0) {
        // @ts-ignore
        await s3.deleteObjects({
            Bucket: `${evento.id}-${process.env.STAGE}`,
            Delete: {
                Objects: Contents.map(({Key}) => ({Key}))
            }
        }).promise();
    }
}

/**
 * Elimina el stack de cloudformation.
 *
 * @param evento
 */
async function eliminarStack(evento: any): Promise<any> {
    const cloudFormation = new CloudFormation({
        region: evento.region
    });

    const params: any = {
        StackName: `${evento.id}-stack`,
        RoleARN: process.env.ROLE_ARN_CLOUDFORMATION
    };

    await cloudFormation.deleteStack(params).promise();
}
