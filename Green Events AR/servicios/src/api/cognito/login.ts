import {Callback, Context, Handler} from 'aws-lambda';

// @ts-ignore
import {AuthenticationDetails, CognitoUser, CognitoUserPool} from 'amazon-cognito-identity-js-node';
import {CognitoIdentityServiceProvider} from 'aws-sdk';
import {AdminGetUserRequest} from 'aws-sdk/clients/cognitoidentityserviceprovider';

import {HttpStatusCode, JsonUtils} from '../../utils';

const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({region: process.env.region});
/**
 * Función que loguea un usuario
 * @param _event
 * @param context
 * @param callback
 */
export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const post: any = JSON.parse(_event.body);

        const tokens: any = await iniciarSesion(post.usuario, post.password);
        const userData: any = await obtenerDatosUsuario(post.usuario);

        const datosRespuesta: any = {};
        datosRespuesta.idToken = tokens.idToken;
        datosRespuesta.accessToken = tokens.accessToken;
        datosRespuesta.refreshToken = tokens.refreshToken;
        datosRespuesta.userData = userData;

        callback(null, JsonUtils.getSuccess(datosRespuesta, HttpStatusCode.OK));

    } catch (err) {
        console.log(JSON.stringify(err));
        callback(null, JsonUtils.getError(err, HttpStatusCode.NOTFOUND));
    }
}

/**
 * Funcion inicia sesión en Cognito.
 *
 * @param username
 * @param password
 */
function iniciarSesion(username: string, password: string): Promise<any> {

    const authDetails = new AuthenticationDetails({
        Username: username,
        Password: password
    });

    const poolData = {
        UserPoolId: process.env.USER_POOL_ID,
        ClientId: process.env.CLIENT_ID
    };

    const userPool = new CognitoUserPool(poolData);

    const userData = {
        Username: username,
        Pool: userPool
    };

    const cognitoUser = new CognitoUser(userData);

    return new Promise((resolve, reject) => {
        cognitoUser.authenticateUser(authDetails, {
            onSuccess: async () => {
                console.log('Inicio de sesión exitoso para el usuario: ' + username);

                const tokens: any = {
                    idToken: cognitoUser.getSignInUserSession().getIdToken().jwtToken,
                    accessToken: cognitoUser.getSignInUserSession().getAccessToken().jwtToken,
                    refreshToken: cognitoUser.getSignInUserSession().getRefreshToken().token,
                };

                resolve(tokens);
            },
            onFailure: (err: any) => {
                console.log('Mensaje error', JSON.stringify(err));
                reject('Usuario o clave incorrectos');
            }
        });
    });
}

/**
 * Obtiene los datos de un usuario del UserPool.
 *
 * @param username
 */
export async function obtenerDatosUsuario(username: string): Promise<any> {
    const params: AdminGetUserRequest = {
        Username: username,
        UserPoolId: String(process.env.USER_POOL_ID)
    };

    const data: any = await cognitoIdentityServiceProvider.adminGetUser(params).promise();
    const userData: any = {};

    userData.usuario = data.Username;

    const userAttributes = data.UserAttributes;
    for (const attrType of userAttributes) {
        const name: string = attrType.Name;
        const value: string = attrType.Value || '';

        switch (name) {
            case 'name':
                userData.nombre = value;
                break;
            case 'custom:rut':
                userData.rut = value;
                break;
            case 'email':
                userData.email = value;
                break;
        }
    }

    return userData;
}
