/**
 * Field-log RAG Retriever Module.
 *
 * NOTE: no live embedding model / pgvector instance is wired in this demo, so
 * retrieval uses a lexical relevance score (query-term overlap against the
 * document title + summary + metadata) rather than true vector cosine
 * similarity. Crucially, the `query` now actually drives the ranking — it was
 * previously ignored, with hardcoded similarity scores returned regardless of
 * the query. Swap `scoreRelevance` for a real embedding lookup to upgrade.
 */

export interface RAGSearchOptions {
  query: string;
  district?: string;
  limit?: number;
  matchThreshold?: number;
}

export interface RAGSearchResult {
  vectorId: string;
  logId: string;
  title: string;
  contentSummary: string;
  similarity: number;
  metadata: {
    district?: string;
    vulnerabilityFlag?: boolean;
    grmTicketId?: string;
    esfCategory?: string;
  };
}

const MOCK_VECTOR_STORE: RAGSearchResult[] = [
  {
    vectorId: 'vec_001',
    logId: 'log_101',
    title: 'Karez Water Rights Field Assessment',
    contentSummary: 'Survey of traditional usufruct Karez water rights allocation in Pishin district. Local elders report ancestral canal maintenance customs.',
    similarity: 0.89,
    metadata: { district: 'Pishin', vulnerabilityFlag: true, esfCategory: 'ESS7' },
  },
  {
    vectorId: 'vec_002',
    logId: 'log_102',
    title: 'GRM Ticket Resettlement Claim Review',
    contentSummary: 'ESS10 stakeholder consultation record regarding land parcel compensation for flood control infrastructure in Quetta Basin.',
    similarity: 0.82,
    metadata: { district: 'Quetta', grmTicketId: 'GRM-2026-088', esfCategory: 'ESS10' },
  },
  {
    vectorId: 'vec_003',
    logId: 'log_103',
    title: 'Balochistan Communal Grazing Land Audit',
    contentSummary: 'Qualitative analysis of nomadic pastoralist usufruct routes across Mastung and Kalat districts under customary tribal law.',
    similarity: 0.76,
    metadata: { district: 'Mastung', vulnerabilityFlag: false, esfCategory: 'ESS5' },
  },
];

const STOPWORDS = new Set([
  'the', 'and', 'for', 'are', 'with', 'from', 'that', 'this', 'what', 'which',
  'was', 'were', 'has', 'have', 'into', 'about', 'over', 'under', 'their',
]);

function tokenize(text: string): string[] {
  return (text || '')
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter((t) => t.length > 2 && !STOPWORDS.has(t));
}

/**
 * Lexical relevance in [0,1]: fraction of the query's distinct terms that appear
 * in the document's searchable text. Stands in for embedding cosine similarity.
 */
function scoreRelevance(queryTerms: string[], doc: RAGSearchResult): number {
  if (queryTerms.length === 0) return 0;
  const haystack = new Set(
    tokenize(`${doc.title} ${doc.contentSummary} ${Object.values(doc.metadata).join(' ')}`)
  );
  const hits = queryTerms.filter((t) => haystack.has(t)).length;
  return Number((hits / queryTerms.length).toFixed(2));
}

export async function retrieveFieldLogEmbeddings(options: RAGSearchOptions): Promise<RAGSearchResult[]> {
  const limit = options.limit || 5;

  let candidates = MOCK_VECTOR_STORE;
  if (options.district) {
    candidates = candidates.filter(
      (doc) => doc.metadata.district?.toLowerCase() === options.district?.toLowerCase()
    );
  }

  const queryTerms = Array.from(new Set(tokenize(options.query)));

  // No usable query terms → return the (district-filtered) candidate set as-is.
  if (queryTerms.length === 0) {
    return candidates.slice(0, limit);
  }

  const scored = candidates
    .map((doc) => ({ ...doc, similarity: scoreRelevance(queryTerms, doc) }))
    .sort((a, b) => b.similarity - a.similarity);

  // Prefer documents that actually match the query; if nothing matches, fall
  // back to the district-filtered set so the agent still has context to reason over.
  const matched = scored.filter((doc) => doc.similarity > 0);
  return (matched.length > 0 ? matched : scored).slice(0, limit);
}
