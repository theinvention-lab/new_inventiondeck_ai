import type { BizCard, CardCategory } from '../types';

const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

interface BusinessCardRow {
  id: string;
  category: string;
  title: string;
  description: string | null;
  summary: string;
  case: string | null;
  sort_order: number | null;
}

const CATEGORY_ALIASES: Record<string, CardCategory> = {
  '산업': 'industry',
  'industry': 'industry',
  '고객유형': 'customer',
  '고객': 'customer',
  'customer': 'customer',
  '문제영역': 'problem',
  '문제': 'problem',
  'problem': 'problem',
  '비즈니스모델': 'businessModel',
  'businessmodel': 'businessModel',
  '수익모델': 'revenue',
  '수익': 'revenue',
  'revenue': 'revenue',
  '기술트렌드': 'technology',
  '기술': 'technology',
  '트렌드': 'technology',
  'technology': 'technology',
  'tech': 'technology',
};

function normalizeCategory(raw: string): CardCategory | null {
  const key = raw.trim().toLowerCase().replace(/[·・\s_-]+/g, '');
  return CATEGORY_ALIASES[key] ?? null;
}

function toBizCard(row: BusinessCardRow, index: number, total: number): BizCard | null {
  const category = normalizeCategory(row.category);
  if (!category) {
    console.warn(`[supabaseCards] Unrecognized category "${row.category}" on card ${row.id}, skipping.`);
    return null;
  }
  const popularity = Math.round(((total - index) / total) * 100);
  return {
    id: row.id,
    category,
    title: row.title,
    description: row.description ?? row.summary ?? '',
    example: row.case ?? '',
    tags: [row.category, ...row.title.split(/\s+/)].filter(Boolean),
    popularity,
  };
}

// Fetches the curated business-card dataset from Supabase (public.business_cards,
// gated by is_active + RLS). Falls back to the local procedural dataset (see
// data/cards.ts) on any network/config failure — this must never throw.
export async function fetchSupabaseCards(): Promise<BizCard[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const url = `${SUPABASE_URL}/rest/v1/business_cards?select=id,category,title,description,summary,case,sort_order&is_active=eq.true&order=sort_order.asc.nullslast&limit=8000`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });

  if (!res.ok) {
    throw new Error(`Supabase card fetch failed: ${res.status} ${res.statusText}`);
  }

  const rows = (await res.json()) as BusinessCardRow[];
  return rows.map((row, i) => toBizCard(row, i, rows.length)).filter((c): c is BizCard => c !== null);
}
