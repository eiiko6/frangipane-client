import { useFluent } from 'fluent-vue';
import { ApiError } from './api/client';

export function useErrorTranslator() {
    const { $t } = useFluent();

    function translateError(err: unknown): string {
        if (err instanceof ApiError) {
            // Convert "AUTH_INVALID_CREDENTIALS" -> "error-auth-invalid-credentials"
            const key = `error-${err.code.toLowerCase().replace(/_/g, '-')}`;

            const translated = $t(key);

            // Fallback to the message provided by backend.
            if (translated === key) {
                return err.message;
            }

            return translated;
        }

        if (err instanceof Error) {
            return err.message;
        }

        return $t('shared-error');
    }

    return { translateError };
}
