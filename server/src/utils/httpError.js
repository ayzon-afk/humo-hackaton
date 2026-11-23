/** Ошибка с HTTP-статусом — её ловит errorHandler и отдаёт клиенту понятный текст */
export const httpError = (status, message) => Object.assign(new Error(message), { status });
