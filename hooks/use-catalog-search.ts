"use client";

import { useEffect, useRef, useState } from "react";

import { SEARCH_MIN_LENGTH, type CatalogSearchResult } from "@/features/catalog/search";

const EMPTY: CatalogSearchResult = { products: [], categories: [], suppliers: [] };
const DEBOUNCE_MS = 250;

interface UseCatalogSearch {
  readonly results: CatalogSearchResult;
  readonly loading: boolean;
}

/**
 * Busca no catálogo enquanto o usuário digita: aplica debounce, consulta a rota
 * `/api/search` e cancela requisições em voo (evita respostas fora de ordem).
 * Termos abaixo de `SEARCH_MIN_LENGTH` não disparam consulta.
 */
export function useCatalogSearch(term: string): UseCatalogSearch {
  const [results, setResults] = useState<CatalogSearchResult>(EMPTY);
  const [loading, setLoading] = useState(false);
  const controllerRef = useRef<AbortController | null>(null);

  useEffect(() => {
    const q = term.trim();

    if (q.length < SEARCH_MIN_LENGTH) {
      controllerRef.current?.abort();
      setResults(EMPTY);
      setLoading(false);
      return;
    }

    setLoading(true);
    const handle = setTimeout(() => {
      controllerRef.current?.abort();
      const controller = new AbortController();
      controllerRef.current = controller;

      fetch(`/api/search?q=${encodeURIComponent(q)}`, { signal: controller.signal })
        .then((response) =>
          response.ok ? (response.json() as Promise<CatalogSearchResult>) : EMPTY,
        )
        .then((data) => {
          setResults(data);
          setLoading(false);
        })
        .catch((error: unknown) => {
          if (error instanceof DOMException && error.name === "AbortError") return;
          setResults(EMPTY);
          setLoading(false);
        });
    }, DEBOUNCE_MS);

    return () => clearTimeout(handle);
  }, [term]);

  // Cancela qualquer requisição pendente ao desmontar.
  useEffect(() => () => controllerRef.current?.abort(), []);

  return { results, loading };
}
