import {Callback, Context, Handler} from 'aws-lambda';
import {S3} from 'aws-sdk';

import {HttpStatusCode, JsonUtils} from '../../utils';

const s3 = new S3();

const ACL = 'public-read';
const OCTET_STREAM = 'binary/octet-stream';

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    try {
        const post: any = JSON.parse(_event.body);

        const pathEvento = `eventos/${post.id}`;

        let params: any = {
            Bucket: process.env.BUCKET,
            Key: `${pathEvento}/cabecera.png`,
            Expires: 60 * 60,
            ContentType: OCTET_STREAM,
            ACL: ACL,
        };

        const respuesta: any = {
            path: pathEvento,
            key: params.Key,
            url: await s3.getSignedUrlPromise('putObject', params),
            modelos: []
        };

        for (let i = 0; i < post.totalExp; i++) {
            params.Key = `${pathEvento}/${i}/sitio.zip`
            respuesta.modelos.push({
                key: params.Key,
                url: await s3.getSignedUrlPromise('putObject', params)
            });
        }

        callback(null, JsonUtils.getSuccess(respuesta, HttpStatusCode.OK));

    } catch (err) {
        console.log(JSON.stringify(err));
        callback(null, JsonUtils.getError(err, HttpStatusCode.INTERNAL_SERVER_ERROR));
    }
}
