import { HttpErrorResponse } from '@angular/common/http';

interface ApiErrorBody {
    userMessage?: string;
    suggestedAction?: string;
    correlationId?: string;
    detail?: string;
    title?: string;
    message?: string;
    error?: string | { message?: string };
}

/** Mensaje unico para errores del back: userMessage + accion sugerida + codigo de seguimiento. */
export function extractApiErrorMessage(error: unknown, fallback: string): string {
    if (!(error instanceof HttpErrorResponse)) {
        return fallback;
    }

    const body = (error.error && typeof error.error === 'object' ? error.error : {}) as ApiErrorBody;
    const nestedError = typeof body.error === 'object' ? body.error?.message : body.error;
    const baseMessage = body.userMessage
        || body.detail
        || body.message
        || nestedError
        || (typeof error.error === 'string' && error.error.trim() ? error.error : '')
        || statusMessage(error.status)
        || fallback;

    const suggestedAction = body.userMessage && body.suggestedAction ? ` ${body.suggestedAction}` : '';
    const correlationId = body.correlationId || error.headers?.get('X-Correlation-Id');
    const tracking = correlationId ? ` (Codigo de seguimiento: ${correlationId})` : '';

    return `${baseMessage}${suggestedAction}${tracking}`;
}

function statusMessage(status: number): string {
    switch (status) {
        case 0:
            return 'No se pudo conectar con el servidor.';
        case 401:
            return 'Tu sesion expiro. Volve a iniciar sesion.';
        case 403:
            return 'No tenes permiso para realizar esta accion.';
        case 404:
            return 'No se encontro el recurso solicitado.';
        default:
            return '';
    }
}
