"use client";

import { useMemo, useState } from "react";
import { X } from "lucide-react";

import { nativeSelectClass } from "@/components/ui/native-select";

interface ProductOption {
  readonly id: string;
  readonly name: string;
}

interface RelatedProductsFieldProps {
  readonly name: string;
  readonly options: readonly ProductOption[];
  readonly initial?: readonly string[];
}

/**
 * Seletor de produtos relacionados (auto-relação N:N). Um `<select>` "adicionar"
 * insere o produto escolhido; os selecionados viram chips removíveis. A lista de
 * ids é serializada num input hidden (`name`) em JSON — mesmo padrão de imagens/
 * sabores. Só ids ainda não escolhidos aparecem no seletor.
 */
export function RelatedProductsField({
  name,
  options,
  initial = [],
}: RelatedProductsFieldProps): React.ReactElement {
  const [selected, setSelected] = useState<string[]>(() =>
    initial.filter((id) => options.some((option) => option.id === id)),
  );

  const nameById = useMemo(
    () => new Map(options.map((option) => [option.id, option.name])),
    [options],
  );

  const available = options.filter((option) => !selected.includes(option.id));

  const add = (id: string): void => {
    if (id && !selected.includes(id)) {
      setSelected((prev) => [...prev, id]);
    }
  };

  const remove = (id: string): void => {
    setSelected((prev) => prev.filter((item) => item !== id));
  };

  return (
    <div className="space-y-3">
      <input type="hidden" name={name} value={JSON.stringify(selected)} />

      {selected.length > 0 && (
        <ul className="flex flex-wrap gap-2">
          {selected.map((id) => (
            <li key={id}>
              <span className="bg-accent text-accent-foreground inline-flex items-center gap-1.5 rounded-full py-1 pr-1 pl-3 text-sm font-medium">
                {nameById.get(id) ?? id}
                <button
                  type="button"
                  onClick={() => remove(id)}
                  aria-label={`Remover ${nameById.get(id) ?? "produto"}`}
                  className="hover:bg-background/60 flex size-5 items-center justify-center rounded-full transition"
                >
                  <X className="size-3.5" />
                </button>
              </span>
            </li>
          ))}
        </ul>
      )}

      {available.length > 0 ? (
        <select
          value=""
          onChange={(event) => {
            add(event.target.value);
            event.target.value = "";
          }}
          className={nativeSelectClass}
        >
          <option value="" disabled>
            {selected.length === 0 ? "Selecione um produto..." : "Adicionar outro produto..."}
          </option>
          {available.map((option) => (
            <option key={option.id} value={option.id}>
              {option.name}
            </option>
          ))}
        </select>
      ) : (
        <p className="text-muted-foreground text-sm">
          {options.length === 0
            ? "Cadastre outros produtos para poder relacioná-los."
            : "Todos os produtos já foram adicionados."}
        </p>
      )}
    </div>
  );
}
