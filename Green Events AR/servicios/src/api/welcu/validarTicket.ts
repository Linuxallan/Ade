import {Callback, Context, Handler} from 'aws-lambda';
import fetch from 'node-fetch';

import {HttpStatusCode, JsonUtils, obtenerSecreto} from '../../utils';

export const handler: Handler = async (_event: any, context: Context, callback: Callback) => {
    context.callbackWaitsForEmptyEventLoop = false;

    if (!_event.headers.evento) {
        callback(null, JsonUtils.getError('Evento no especificado',
            HttpStatusCode.FORBIDDEN));
    }

    try {
        const token = await obtenerSecreto(
            `${_event.headers.evento}-${process.env.STAGE}-token`);
        console.log(token);

        const datosAcceso: any = JSON.parse(_event.body);
        console.log(datosAcceso);

        let respuesta: any;

        if (datosAcceso.email) {
            respuesta = await consultarTicketEmail(token, datosAcceso.email);
            console.log(respuesta);
        }

        if (!respuesta && datosAcceso.codigo) {
            respuesta = await consultarTicket(token, datosAcceso.codigo);
            console.log(respuesta);
        }

        if (respuesta.status && respuesta.status === '404') {
            callback(null, JsonUtils.getError(respuesta.error, parseInt(respuesta.status)));
        } else {
            const data: any = {
                nombre: `${respuesta.first_name} ${respuesta.last_name}`,
                email: respuesta.email,
                codigo: respuesta.ticket ? respuesta.ticket : datosAcceso.codigo
            };

            callback(null, JsonUtils.getSuccess(data, HttpStatusCode.OK));
        }

    } catch (e) {
        console.log('Error al consultar ticket', JSON.stringify(e));
        callback(null, JsonUtils.getError('Error al obtener ticket', HttpStatusCode.BADREQUEST));
    }
}

async function consultarTicket(token: string, codigo: string) {
    const url = `${process.env.URL_WELCU}/${codigo}.json`;
    const response: any = await fetch(url, {
        method: 'GET',
        headers: {
            'Authorization': `event ${token}`
        }
    });

    return await response.json();
}

async function consultarTicketEmail(token: string, email: string) {
    const response: any = await fetch(`${process.env.URL_WELCU_LIST}`, {
        method: 'GET',
        headers: {
            'Authorization': `event ${token}`
        }
    });

    const invitados: any = await response.json();
    console.log(invitados);
    if (invitados.error) {
        return {status: '404', error: invitados.error};
    } else {
        const invitado: any = invitados.find((inv: any) => inv.email === email);

        if (invitado && invitado.tickets && invitado.tickets.length > 0) {
            invitado.ticket = invitado.tickets[0].code;
        }

        console.log(invitado);
        return invitado ? invitado : {status: '404', error: 'Correo no registrado'};
    }
}
