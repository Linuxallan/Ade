import {Callback, Context, Handler} from 'aws-lambda';
import {CognitoIdentityServiceProvider} from 'aws-sdk';

import {HttpStatusCode, JsonUtils} from '../../utils';

const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({region: process.env.region});

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {

    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const usuarios: any[] = [];
        const datosCognito: any = await getUsers();

        const cognitoUsersListType: CognitoIdentityServiceProvider.UsersListType = datosCognito.Users || [];

        for (let userType of cognitoUsersListType) {
            const userData: any = {
                usuario: userType.Username
            };

            if (userType.Attributes) {
                for (const attrType of userType.Attributes) {
                    const name: string = attrType.Name;
                    const value: string = attrType.Value || '';

                    switch (name) {
                        case 'name':
                            userData.nombre = value;
                            break;
                        case 'email':
                            userData.email = value;
                            break;
                    }
                }
            }

            usuarios.push(userData);
        }


        callback(null, JsonUtils.getSuccess(usuarios, HttpStatusCode.OK));
    } catch (err) {
        console.log(JSON.stringify(err));
        callback(null, JsonUtils.getError(err, HttpStatusCode.BADREQUEST));
    }

}

/**
 * Lista usuarios en cognito.
 *
 * @param userData
 */
async function getUsers() {

    const params: any = {
        AttributesToGet: null,
        Limit: 0,
        UserPoolId: String(process.env.USER_POOL_ID),
        Filter: 'cognito:user_status = \"CONFIRMED\"'
    };

    return cognitoIdentityServiceProvider.listUsers(params).promise();

}
