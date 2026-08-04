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
}

// The live Supabase category values (public.business_cards / business_cards_2):
// Theme, Tech, Revenue, Trend, Target (→ 고객 세그먼트), Feature. "Target" is
// the confirmed real column value for the segment/customer category — it does
// not literally say "Segment". Matching is substring-based and
// case-insensitive so minor variants and Korean labels still land correctly
// instead of being silently dropped.
const CATEGORY_KEYWORDS: Array<{ category: CardCategory; keywords: string[] }> = [
  { category: 'theme', keywords: ['theme', '산업'] },
  { category: 'trend', keywords: ['trend', '트렌드'] },
  { category: 'tech', keywords: ['tech', '기술'] },
  { category: 'revenue', keywords: ['revenue', '수익'] },
  { category: 'segment', keywords: ['target', 'segment', 'segement', '세그먼트', '고객'] },
  { category: 'feature', keywords: ['feature', '피쳐', '피처'] },
];

function normalizeCategory(raw: string): CardCategory | null {
  const key = raw.trim().toLowerCase();
  const match = CATEGORY_KEYWORDS.find(({ keywords }) => keywords.some((kw) => key.includes(kw)));
  return match?.category ?? null;
}

function toBizCard(row: BusinessCardRow, popularity: number): BizCard | null {
  const category = normalizeCategory(row.category);
  if (!category) {
    console.warn(`[supabaseCards] Unrecognized category "${row.category}" on card ${row.id}, skipping.`);
    return null;
  }
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

async function fetchTable(table: string, orderColumn: string, extraFilter = ''): Promise<BusinessCardRow[]> {
  const url = `${SUPABASE_URL}/rest/v1/${table}?select=id,category,title,description,summary,case&order=${orderColumn}&limit=8000${extraFilter}`;
  const res = await fetch(url, {
    headers: {
      apikey: SUPABASE_ANON_KEY as string,
      Authorization: `Bearer ${SUPABASE_ANON_KEY}`,
    },
  });
  if (!res.ok) {
    throw new Error(`Supabase "${table}" fetch failed: ${res.status} ${res.statusText}`);
  }
  return (await res.json()) as BusinessCardRow[];
}

// Fetches the curated business-card dataset from Supabase — cards live in two
// tables (public.business_cards, keyed by sort_order + is_active, and
// public.business_cards_2, keyed by created_at) with the same shape. Falls
// back to the local procedural dataset (see data/cards.ts) on any
// network/config failure — this must never throw.
export async function fetchSupabaseCards(): Promise<BizCard[]> {
  if (!SUPABASE_URL || !SUPABASE_ANON_KEY) return [];

  const [primary, secondary] = await Promise.allSettled([
    fetchTable('business_cards', 'sort_order.asc.nullslast', '&is_active=eq.true'),
    fetchTable('business_cards_2', 'created_at.asc'),
  ]);

  const rows: BusinessCardRow[] = [];
  if (primary.status === 'fulfilled') rows.push(...primary.value);
  else console.warn('[supabaseCards] business_cards fetch failed.', primary.reason);

  if (secondary.status === 'fulfilled') rows.push(...secondary.value);
  else console.warn('[supabaseCards] business_cards_2 fetch failed.', secondary.reason);

  if (rows.length === 0) {
    if (primary.status === 'rejected' && secondary.status === 'rejected') {
      throw new Error('Both Supabase card tables failed to load.');
    }
    return [];
  }

  const total = rows.length;
  return rows
    .map((row, i) => toBizCard(row, Math.round(((total - i) / total) * 100)))
    .filter((c): c is BizCard => c !== null);
}
