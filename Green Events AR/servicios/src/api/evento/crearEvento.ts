import {Callback, Context, Handler} from 'aws-lambda';
import {CloudFormation, DynamoDB} from 'aws-sdk';
import {tz} from 'moment-timezone';

import {HttpStatusCode, JsonUtils, obtenerSecreto, StatusEvento} from '../../utils';

const client = new DynamoDB.DocumentClient();

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        let eventData: any = JSON.parse(_event.body);

        eventData = await guardarEvento(eventData, true);
        console.log(JSON.stringify(eventData));

        eventData.stackId = await crearStack(eventData);
        await guardarEvento(eventData, false);

        callback(null, JsonUtils.getSuccess('ok', HttpStatusCode.OK));
    } catch (e) {
        console.log('Error al crear evento', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al crear evento', HttpStatusCode.BADREQUEST));
    }
}

/**
 * Guarda evento en DynamoDB.
 *
 * @param eventData
 * @param crear
 */
async function guardarEvento(eventData: any, crear: boolean): Promise<any> {
    if (crear) {
        const hoy = tz('America/Santiago');

        eventData.fecha = hoy.format('YYYY-MM-DD:HH:mm:ss');
        eventData.estado = StatusEvento.IN_PROGRESS;
    }

    const params: any = {
        TableName: process.env.TABLA_EVENTOS,
        Item: eventData
    };

    await client.put(params).promise();
    return eventData;
}

async function crearStack(eventData: any): Promise<any> {
    let secreto = await obtenerSecreto(String(process.env.SECRET_GITHUB));
    secreto = JSON.parse(secreto);
    console.log('Secreto', secreto);

    const cloudFormation: any = new CloudFormation({
        region: eventData.region
    });

    const params: any = {
        StackName: `${eventData.id}-stack`,
        Parameters: [{
            ParameterKey: 'Codigo',
            ParameterValue: eventData.id
        }, {
            ParameterKey: 'Stage',
            ParameterValue: process.env.STAGE
        }, {
            ParameterKey: 'Dominio',
            ParameterValue: process.env.CF_DOMINIO
        }, {
            ParameterKey: 'SubDominio',
            ParameterValue: eventData.dominio
        }, {
            ParameterKey: 'Token',
            ParameterValue: eventData.token
        }, {
            ParameterKey: 'ArnCertificado',
            ParameterValue: process.env.CERTIFICATE_ARN
        }, {
            ParameterKey: 'ArnCodeBuildRole',
            ParameterValue: process.env.CF_ROL_CODEBUILD
        }, {
            ParameterKey: 'ArnCodePipelineRol',
            ParameterValue: process.env.CF_ROL_PIPELINE
        }, {
            ParameterKey: 'NombreBucketServicios',
            ParameterValue: process.env.BUCKET
        }, {
            ParameterKey: 'Repositorio',
            ParameterValue: process.env.CF_REPOSITORIO
        }, {
            ParameterKey: 'Branch',
            ParameterValue: process.env.CF_BRANCH
        }, {
            ParameterKey: 'RegionOrigen',
            ParameterValue: process.env.REGION
        }, {
            ParameterKey: 'GitHubOAuthToken',
            ParameterValue: secreto.GitHubOAuthToken
        }, {
            ParameterKey: 'GitHubOwner',
            ParameterValue: secreto.GitHubOwner
        }, {
            ParameterKey: 'GitHubRepo',
            ParameterValue: secreto.GitHubRepo
        }, {
            ParameterKey: 'GitHubBranch',
            ParameterValue: secreto.GitHubBranch
        }, {
            ParameterKey: 'ApiKey',
            ParameterValue: eventData.apiKey
        }],
        Tags: [{
            Key: 'Sistema',
            Value: 'Green Events'
        }, {
            Key: 'Stage',
            Value: process.env.STAGE
        }, {
            Key: 'Evento',
            Value: eventData.id
        }],
        RoleARN: process.env.ROLE_ARN_CLOUDFORMATION,
        TemplateURL: process.env.URL_TEMPLATE
    };

    const result = await cloudFormation.createStack(params).promise();
    console.log(JSON.stringify(result));

    return result.StackId;
}
