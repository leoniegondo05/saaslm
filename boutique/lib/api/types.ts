/*
  Types partagés par tous les services API (lib/api/services/*).
  Le format d'erreur suit celui de Laravel (validation 422 notamment) :
  https://laravel.com/docs/validation#quick-displaying-the-validation-errors
*/

// Erreurs de validation Laravel : { champ: ["message1", "message2"] }
export type ApiValidationErrors = Record<string, string[]>;

export interface ApiErrorPayload {
  message: string;
  errors?: ApiValidationErrors;
}

export class ApiError extends Error {
  status: number;
  errors?: ApiValidationErrors;

  constructor(status: number, payload: ApiErrorPayload) {
    super(payload.message);
    this.name = "ApiError";
    this.status = status;
    this.errors = payload.errors;
  }

  // Premier message de validation pour un champ donné — pratique pour
  // afficher l'erreur sous un input précis (voir hooks/useApiRequest.ts).
  fieldError(field: string): string | undefined {
    return this.errors?.[field]?.[0];
  }
}
