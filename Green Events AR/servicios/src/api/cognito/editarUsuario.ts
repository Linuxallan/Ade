import {Callback, Context, Handler} from 'aws-lambda';
import {HttpStatusCode, JsonUtils, UsuarioExiste} from '../../utils';
import {CognitoIdentityServiceProvider} from 'aws-sdk';

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
            await updateUser(userData);

            if (userData.clave) {
                await changePassword(userData.usuario, userData.clave);
            }
        }

        callback(null, JsonUtils.getSuccess(`Usuario [${userData.usuario}] actualizado correctamente.`,
            HttpStatusCode.OK));

    } catch (err) {
        console.log(JSON.stringify(err));
        callback(null, JsonUtils.getError(err, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
}

/**
 * Actualiza un usuario en cognito.
 *
 * @param userData
 */
async function updateUser(userData: any) {

    const atributos: any[] = [
        {Name: 'name', Value: userData.nombre},
        {Name: 'email', Value: userData.email},
        {Name: 'email_verified', Value: 'true'}
    ];

    const params: any = {
        ClientMetadata: [],
        UserAttributes: atributos,
        Username: userData.usuario,
        UserPoolId: process.env.USER_POOL_ID
    };

    await cognitoIdentityServiceProvider.adminUpdateUserAttributes(params).promise();
}

async function changePassword(usuario: string, clave: string): Promise<void> {
    const params: any = {
        Password: clave,
        UserPoolId: process.env.USER_POOL_ID,
        Username: usuario,
        Permanent: true
    };

    await cognitoIdentityServiceProvider.adminSetUserPassword(params).promise();
}
