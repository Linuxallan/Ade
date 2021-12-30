import {Callback, Context, Handler} from 'aws-lambda';
import {CognitoIdentityServiceProvider} from 'aws-sdk';

import {HttpStatusCode, JsonUtils, UsuarioExiste} from '../../utils';

const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({region: process.env.region});

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const userData: any = JSON.parse(_event.body);
        console.log('UserData:', JSON.stringify(userData));

        if (!await UsuarioExiste(`username = \"${userData.usuario}\"`)) {
            callback(null, JsonUtils.getError('Usuario no registrado.',
                HttpStatusCode.CONFLICT));
        } else {
            const params: any = {
                Username: userData.usuario,
                UserPoolId: process.env.USER_POOL_ID
            };

            await cognitoIdentityServiceProvider.adminDeleteUser(params).promise();
        }

        callback(null, JsonUtils.getSuccess(`Usuario [${userData.usuario}] eliminado correctamente.`,
            HttpStatusCode.OK));

    } catch (err) {
        console.log(JSON.stringify(err));
        callback(null, JsonUtils.getError(err, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
}
