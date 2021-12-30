import {Callback, Context, Handler} from 'aws-lambda';
import {CodePipeline, DynamoDB, SecretsManager} from 'aws-sdk';
import {tz} from 'moment-timezone';

import {HttpStatusCode, JsonUtils, StatusEvento} from '../../utils';

const client = new DynamoDB.DocumentClient();

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        let eventData: any = JSON.parse(_event.body);
        console.log(JSON.stringify(eventData));

        let params: any = {
            TableName: process.env.TABLA_EVENTOS,
            KeyConditionExpression: 'id = :id ',
            ExpressionAttributeValues: {
                ':id': eventData.id
            }
        };

        const resultado: any = await client.query(params).promise();

        if (resultado.Items && resultado.Items.length > 0) {
            const evento: any = resultado.Items[0];

            evento.descripcion = eventData.descripcion;
            evento.titulo = eventData.titulo;
            evento.token = eventData.token;
            evento.experiencias = eventData.experiencias;

            const hoy = tz('America/Santiago');
            evento.fechaActualizacion = hoy.format('YYYY-MM-DD:HH:mm:ss');

            evento.estado = StatusEvento.UPDATING;

            const params: any = {
                TableName: process.env.TABLA_EVENTOS,
                Item: evento
            };

            await client.put(params).promise();
            await actualizarSitio(evento);
            await actualizarSecreto(evento);

            callback(null, JsonUtils.getSuccess('ok', HttpStatusCode.OK));
        } else {
            callback(null, JsonUtils.getError('No se encuentra evento', HttpStatusCode.NOTFOUND));
        }

    } catch (e) {
        console.log('Error al editar evento', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al editar evento', HttpStatusCode.BADREQUEST));
    }
}

/**
 * Ejecuta pipeline de instalación.
 *
 * @param evento
 */
async function actualizarSitio(evento: any): Promise<void> {
    const codepipeline = new CodePipeline({region: evento.region});

    const params: any = {
        name: `${evento.id}-${process.env.STAGE}-pipe`
    };

    await codepipeline.startPipelineExecution(params).promise();
}

async function actualizarSecreto(evento: any): Promise<any> {
    const secretsmanager = new SecretsManager({region: evento.region});

    const params: any = {
        SecretId: `${evento.id}-${process.env.STAGE}-token`,
        SecretString: evento.token
    }

    await secretsmanager.updateSecret(params).promise();
}
