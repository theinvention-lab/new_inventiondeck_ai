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

// The live Supabase category values (public.business_cards / business_cards_2)
// use these exact English labels. Korean aliases are kept as a defensive
// fallback in case either table is ever populated with localized values.
const CATEGORY_ALIASES: Record<string, CardCategory> = {
  theme: 'theme',
  '산업': 'theme',
  tech: 'tech',
  technology: 'tech',
  '기술': 'tech',
  revenue: 'revenue',
  '수익모델': 'revenue',
  '수익': 'revenue',
  trend: 'trend',
  '트렌드': 'trend',
  segment: 'segment',
  segement: 'segment', // defensive: common typo for "segment"
  '고객세그먼트': 'segment',
  '고객': 'segment',
  feature: 'feature',
  '비즈니스피쳐': 'feature',
  '비즈니스피처': 'feature',
};

function normalizeCategory(raw: string): CardCategory | null {
  const key = raw.trim().toLowerCase().replace(/[·・\s_-]+/g, '');
  return CATEGORY_ALIASES[key] ?? null;
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
