import {Callback, Context, Handler} from 'aws-lambda';

import {CognitoIdentityServiceProvider} from 'aws-sdk';
// @ts-ignore
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js-node';
import {generate} from 'generate-password';

import {HttpStatusCode, JsonUtils, UsuarioExiste} from '../../utils';

const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({region: process.env.region});

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const userData: any = JSON.parse(_event.body);
        console.log('UserData:', JSON.stringify(userData));

        if (await UsuarioExiste(`username = \"${userData.usuario}\"`)) {
            callback(null, JsonUtils.getError('Nombre de usuario ya se encuentra registrado',
                HttpStatusCode.CONFLICT));
        } else {
            const claveTmp = await createUser(userData);
            await completarDesafio(userData.usuario, claveTmp, userData.clave);

            callback(null, JsonUtils.getSuccess(`Usuario [${userData.usuario}] creado correctamente.`,
                HttpStatusCode.OK));
        }

    } catch (err) {
        console.log(JSON.stringify(err));
        callback(null, JsonUtils.getError(err, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
}

/**
 * Registra un nuevo usuario en cognito.
 *
 * @param userData
 * @param event
 */
async function createUser(userData: any) {
    const tmpPassword: string = genPassword();
    console.log('tmpPassword', tmpPassword)

    const params: any = {
        UserPoolId: process.env.USER_POOL_ID,
        Username: userData.usuario,
        DesiredDeliveryMediums: ['EMAIL'],
        ForceAliasCreation: false,
        TemporaryPassword: tmpPassword,
        MessageAction: 'SUPPRESS',
        UserAttributes: [
            {Name: 'name', Value: userData.nombre},
            {Name: 'email', Value: userData.email}
        ]
    };

    console.log('Parametros usuario:', JSON.stringify(params));

    await cognitoIdentityServiceProvider.adminCreateUser(params).promise();
    return tmpPassword;
}

/**
 * Completa el desafio de cambio de clave de un nuevo usuario.
 *
 * @param usuario
 * @param tmpPassword
 * @param password
 */
async function completarDesafio(usuario: string, tmpPassword: string, password: string): Promise<any> {
    const userPool = new CognitoUserPool({
        UserPoolId: process.env.USER_POOL_ID,
        ClientId: process.env.CLIENT_ID
    });
    const authDetails = new AuthenticationDetails({
        Username: usuario,
        Password: tmpPassword
    });
    const cognitoUser = new CognitoUser({Username: usuario, Pool: userPool});

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authDetails, {
            onFailure: function (err: any) {
                console.log(err);
                reject(err.code);
            },
            newPasswordRequired: function (userAttributes: any) {
                console.log(userAttributes);
                cognitoUser.completeNewPasswordChallenge(password, userAttributes, {
                    onSuccess: function (result: any) {
                        console.log('Password challenge completado exitosamente para el usuario %s', usuario);
                        resolve(result);
                    },
                    onFailure: function (err: any) {
                        console.log('Password challenge completado fallidamente para el usuario %s', usuario);
                        console.log(err);
                        reject(err);
                    }
                });
            }
        });
    });
}

/**
 * Genera una clave
 */
function genPassword() {
    return generate({
        length: 8,
        numbers: true,
        strict: true
    });
}
