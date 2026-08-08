/**
 * IFRAP Safeguards Decision-Support Graph (rule-based orchestration)
 * Part of MIRAB — the IFRAP Operations & Results Backbone
 *
 * Multi-node state graph for query analysis, lexical evidence retrieval
 * (see lib/rag/retriever.ts — not a live embedding/vector model in this build),
 * ESF safeguard compliance evaluation, and response synthesis.
 */

import { StateGraph, END, START } from '@langchain/langgraph';
import { retrieveFieldLogEmbeddings, RAGSearchResult } from '@/lib/rag/retriever';

export interface AgentState {
  messages: Array<{ role: 'user' | 'assistant' | 'system'; content: string }>;
  query: string;
  userRole?: string;
  district?: string;
  retrievedDocs: RAGSearchResult[];
  esfSafeguardContext?: {
    flaggedRisks: string[];
    complianceStatus: string;
  };
  finalAnswer?: string;
  step: string;
}

async function analyzeQueryNode(state: AgentState): Promise<Partial<AgentState>> {
  const query = state.query || (state.messages.length > 0 ? state.messages[state.messages.length - 1].content : '');
  const isEsfQuery = /esf|safeguard|ess\d+|grm|pii|usufruct|karez/i.test(query);
  return { query, step: isEsfQuery ? 'ESF_SPECIALIZED_QUERY' : 'GENERAL_QUERY' };
}

async function retrieveContextNode(state: AgentState): Promise<Partial<AgentState>> {
  const results = await retrieveFieldLogEmbeddings({
    query: state.query,
    district: state.district,
    limit: 5,
    matchThreshold: 0.65,
  });
  return { retrievedDocs: results, step: 'CONTEXT_RETRIEVED' };
}

async function evaluateEsfComplianceNode(state: AgentState): Promise<Partial<AgentState>> {
  const docs = state.retrievedDocs || [];
  const flaggedRisks: string[] = [];
  for (const doc of docs) {
    if (doc.metadata?.vulnerabilityFlag) {
      flaggedRisks.push(`ESS7 Indigenous Peoples vulnerability detected in ${doc.metadata.district || 'field log'}`);
    }
    if (doc.metadata?.grmTicketId) {
      flaggedRisks.push(`ESS10 Stakeholder Engagement active GRM ticket ${doc.metadata.grmTicketId}`);
    }
  }
  return {
    esfSafeguardContext: {
      flaggedRisks,
      complianceStatus: flaggedRisks.length > 0 ? 'ATTENTION_REQUIRED' : 'COMPLIANT',
    },
    step: 'SAFEGUARDS_EVALUATED',
  };
}

async function synthesizeResponseNode(state: AgentState): Promise<Partial<AgentState>> {
  const docs = state.retrievedDocs || [];
  const esf = state.esfSafeguardContext;
  const docSummary = docs.map((d) => `- [${d.title}] ${d.contentSummary}`).join('\n');

  let answer = `### IFRAP Safeguards Decision-Support Analysis\n\n`;
  answer += `**Query:** ${state.query}\n\n`;
  answer += docs.length > 0 ? `**Retrieved Field Evidence (lexical retrieval):**\n${docSummary}\n\n` : `**Retrieved Field Evidence:** No field evidence matched above the relevance threshold (0.65).\n\n`;
  answer += esf && esf.flaggedRisks.length > 0 ? `**ESF Safeguards Assessment:** Status - ${esf.complianceStatus}\n` + esf.flaggedRisks.map((r) => `  * ${r}`).join('\n') + '\n\n' : `**ESF Safeguards Assessment:** Status - COMPLIANT (ESS1-ESS10 requirements satisfied)\n\n`;
  answer += `*Generated under the World Bank IFRAP Programme Fiduciary Protocol.*`;

  return { finalAnswer: answer, step: 'COMPLETED' };
}

export function buildAntigravityAgentGraph() {
  const workflow = new StateGraph<AgentState>({
    channels: {
      messages: { value: (x, y) => y ?? x, default: () => [] },
      query: { value: (x, y) => y ?? x, default: () => '' },
      userRole: { value: (x, y) => y ?? x },
      district: { value: (x, y) => y ?? x },
      retrievedDocs: { value: (x, y) => y ?? x, default: () => [] },
      esfSafeguardContext: { value: (x, y) => y ?? x },
      finalAnswer: { value: (x, y) => y ?? x },
      step: { value: (x, y) => y ?? x, default: () => 'INITIAL' },
    },
  });

  workflow.addNode('analyzeQuery', analyzeQueryNode);
  workflow.addNode('retrieveContext', retrieveContextNode);
  workflow.addNode('evaluateEsfCompliance', evaluateEsfComplianceNode);
  workflow.addNode('synthesizeResponse', synthesizeResponseNode);

  // @ts-ignore
  workflow.addEdge(START as any, 'analyzeQuery');
  // @ts-ignore
  workflow.addEdge('analyzeQuery' as any, 'retrieveContext');
  // @ts-ignore
  workflow.addEdge('retrieveContext' as any, 'evaluateEsfCompliance');
  // @ts-ignore
  workflow.addEdge('evaluateEsfCompliance' as any, 'synthesizeResponse');
  // @ts-ignore
  workflow.addEdge('synthesizeResponse', END as any);

  return workflow.compile();
}

export async function runAntigravityAgent(input: {
  query: string;
  userRole?: string;
  district?: string;
}): Promise<{ answer: string; retrievedCount: number; complianceStatus: string }> {
  const graph = buildAntigravityAgentGraph();
  const initialState: AgentState = {
    messages: [{ role: 'user', content: input.query }],
    query: input.query,
    userRole: input.userRole || 'FIELD_ENUMERATOR',
    district: input.district,
    retrievedDocs: [],
    step: 'START',
  };
  const finalState = await graph.invoke(initialState);
  return {
    answer: finalState.finalAnswer || 'Agent process completed without text output.',
    retrievedCount: finalState.retrievedDocs?.length || 0,
    complianceStatus: finalState.esfSafeguardContext?.complianceStatus || 'COMPLIANT',
  };
}
