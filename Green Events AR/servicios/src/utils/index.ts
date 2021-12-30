import {CognitoIdentityServiceProvider, SecretsManager} from 'aws-sdk';

const client: any = new SecretsManager({
    region: process.env.REGION
});

export const defaultHeaders = {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Headers': 'Content-Type,Authorization,X-Amz-Date,X-Api-Key,X-Amz-Security-Token',
    'Access-Control-Allow-Methods': 'DELETE,GET,HEAD,OPTIONS,PATCH,POST,PUT',
    'Access-Control-Allow-Origin': '*'
};

export const HttpStatusCode: any = {
    OK: 200,
    CREATE: 201,
    BADREQUEST: 400,
    FORBIDDEN: 403,
    NOTFOUND: 404,
    CONFLICT: 409,
    INTERNAL_SERVER_ERROR: 500
};

export const StatusEvento: any = {
    IN_PROGRESS: 'En progreso',
    UPDATING: 'Actualizando',
    PUBLISHED: 'Publicado',
    FINISHED: 'Finalizado',
    ERROR: 'Error'
};

const cognitoIdentityServiceProvider = new CognitoIdentityServiceProvider({region: process.env.region});

export class JsonUtils {
    static getSuccess(obj: any, code: number) {
        return {
            statusCode: code,
            headers: defaultHeaders,
            body: isJson(obj) ? JSON.stringify(obj) : JSON.stringify({message: obj})
        };
    }

    static getError(obj: any, code: any) {
        return {
            statusCode: code,
            headers: defaultHeaders,
            body: isJson(obj) ? JSON.stringify(obj) : JSON.stringify({message: obj})
        };
    }
}

export const obtenerSecreto = async (secretName: string) => {
    const data = await client.getSecretValue({SecretId: secretName}).promise();

    if ('SecretString' in data) {
        return data.SecretString;
    } else {
        const buff = new Buffer(data.SecretBinary, 'base64');
        return buff.toString('ascii');
    }
}

function isJson(item: any) {
    item = typeof item !== "string"
        ? JSON.stringify(item)
        : item;

    try {
        item = JSON.parse(item);
    } catch (e) {
        return false;
    }

    return typeof item === "object" && item !== null;
}

/**
 * Busca un usuario por un filtro.
 *
 * @param filtro
 */
export async function UsuarioExiste(filtro: string): Promise<boolean> {
    const params: any = {
        AttributesToGet: null,
        Limit: 0,
        UserPoolId: process.env.USER_POOL_ID,
        Filter: filtro
    };

    const usuarios: any = await cognitoIdentityServiceProvider.listUsers(params).promise();

    if (usuarios.Users.length > 0) {
        let existe = false;
        for (let usr of usuarios.Users) {
            existe = existe || usr.UserStatus !== 'EXTERNAL_PROVIDER';
        }

        return existe;
    } else {
        return false;
    }
}
