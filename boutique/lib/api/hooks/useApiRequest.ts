"use client";

import { useCallback, useState } from "react";
import { ApiError } from "../types";

/*
  Hook générique pour tout appel API déclenché par une action utilisateur
  (soumission de formulaire, clic…) : centralise loading/error/data pour
  qu'aucun composant n'ait à réécrire cette logique.

  Usage :
    const { run, loading, error } = useApiRequest(authService.login);
    await run({ email, password });
    // error?.message           -> message global
    // error?.fieldError("email") -> erreur de validation Laravel pour un champ
*/
export function useApiRequest<TArgs extends unknown[], TResult>(
  request: (...args: TArgs) => Promise<TResult>,
) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<ApiError | null>(null);
  const [data, setData] = useState<TResult | null>(null);

  const run = useCallback(
    async (...args: TArgs): Promise<TResult | null> => {
      setLoading(true);
      setError(null);
      try {
        const result = await request(...args);
        setData(result);
        return result;
      } catch (err) {
        const apiError =
          err instanceof ApiError
            ? err
            : new ApiError(0, {
                message:
                  err instanceof Error
                    ? err.message
                    : "Une erreur inattendue est survenue.",
              });
        setError(apiError);
        return null;
      } finally {
        setLoading(false);
      }
    },
    [request],
  );

  return { run, loading, error, data };
}
