/**
 * Formata um valor numérico para moeda brasileira (ex: R$ 38,00).
 */
export function formatBRL(value: number): string {
  const safeValue = Number.isFinite(value) ? value : 0;
  return new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(safeValue);
}

/**
 * Aplica máscara de telefone brasileiro: (16) 99999-9999 ou (16) 3333-4444.
 */
export function formatPhoneBR(input: string): string {
  const digits = input.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

/**
 * Converte texto de valor monetário (ex: "100", "100,00", "R$ 50,50") para número.
 * Retorna null se inválido.
 */
export function parseBRLInput(raw: string): number | null {
  const cleaned = raw.replace(/[R$\s]/g, '').trim();
  if (!cleaned) return null;

  // Se houver vírgula, trata pontos como separador de milhar e vírgula como decimal
  let normalized: string;
  if (cleaned.includes(',')) {
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else {
    normalized = cleaned;
  }

  const parsed = Number(normalized);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    return null;
  }
  return Math.round(parsed * 100) / 100;
}
