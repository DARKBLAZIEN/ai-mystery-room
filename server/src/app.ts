import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import { rateLimit } from 'express-rate-limit';
import mongoose from 'mongoose';
import { resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { CreateCaseSchema } from '@mystery-room/shared';
import { CaseModel } from './models/Case.js';
import { generateCase } from './services/generator.js';
import { env } from './config/env.js';

export const app = express();
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      ...helmet.contentSecurityPolicy.getDefaultDirectives(),
      styleSrc: ["'self'", "'unsafe-inline'", 'https://fonts.googleapis.com'],
      styleSrcAttr: ["'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:']
    }
  }
}));
app.use(cors({ origin: env.clientOrigin }));
app.use(express.json({ limit: '40kb' }));
app.use('/api', rateLimit({ windowMs: 60_000, limit: 40, standardHeaders: true, legacyHeaders: false }));

const publicEvidence = (items: any[]) => items.map((item) => {
  const value = item.toObject ? item.toObject() : item;
  const { internalExplanation: _explanation, classification: _classification, ...safe } = value;
  return safe;
});

app.get('/api/health', (_req, res) => res.json({ status: 'ok', database: mongoose.connection.readyState === 1 ? 'connected' : 'disconnected' }));

app.post('/api/cases', async (req, res, next) => {
  try {
    const parsed = CreateCaseSchema.safeParse(req.body);
    if (!parsed.success) return res.status(400).json({ error: { code: 'VALIDATION_ERROR', message: 'Please check the scenario and case settings.', details: parsed.error.flatten() } });
    const generated = await generateCase(parsed.data);
    const record = await CaseModel.create({ status: 'READY', premise: parsed.data.scenario, publicCase: generated.publicCase, solution: generated.solution, evidence: generated.evidence, generationMetadata: { provider: env.geminiKey ? 'google-gemini' : 'local-demo', model: env.geminiKey ? env.geminiModel : 'deterministic-demo', attempts: 1 } });
    return res.status(201).json({ id: record.id, status: record.status, publicCase: record.publicCase, evidence: publicEvidence(record.evidence) });
  } catch (error) { return next(error); }
});

app.get('/api/cases/:id', async (req, res, next) => {
  try {
    const record = await CaseModel.findById(req.params.id);
    if (!record) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND', message: 'This case could not be found.' } });
    res.json({ id: record.id, status: record.status === 'SOLVED' ? 'SOLVED' : 'READY', premise: record.premise, publicCase: record.publicCase, evidence: publicEvidence(record.evidence), ...(record.status === 'SOLVED' ? { result: (record as any).result } : {}) });
  } catch (error) { next(error); }
});

app.get('/api/cases/:id/evidence/:evidenceId', async (req, res, next) => {
  try {
    const record = await CaseModel.findById(req.params.id);
    if (!record) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND', message: 'This case could not be found.' } });
    const item = record.evidence.find((entry: any) => entry.id === req.params.evidenceId);
    if (!item) return res.status(404).json({ error: { code: 'EVIDENCE_NOT_FOUND', message: 'This evidence item could not be found.' } });
    res.json(publicEvidence([item])[0]);
  } catch (error) { next(error); }
});

app.post('/api/cases/:id/accusations', async (req, res, next) => {
  try {
    const { suspectId } = req.body || {};
    if (typeof suspectId !== 'string') return res.status(400).json({ error: { code: 'INVALID_SUSPECT', message: 'Select a suspect from this case.' } });
    const record = await CaseModel.findById(req.params.id).select('+solution');
    if (!record) return res.status(404).json({ error: { code: 'CASE_NOT_FOUND', message: 'This case could not be found.' } });
    const validSuspect = (record.publicCase as any).suspects.some((suspect: any) => suspect.id === suspectId);
    if (!validSuspect) return res.status(400).json({ error: { code: 'INVALID_SUSPECT', message: 'Select a suspect from this case.' } });
    if (record.status === 'SOLVED') {
      if ((record as any).result?.selectedSuspectId === suspectId) return res.json((record as any).result);
      return res.status(409).json({ error: { code: 'ALREADY_SOLVED', message: 'An accusation has already been submitted for this case.' } });
    }
    const solution: any = record.solution;
    const result = { correct: suspectId === solution.culpritId, selectedSuspectId: suspectId, culpritId: solution.culpritId, motive: solution.motive, method: solution.method, incidentSummary: solution.incidentSummary, timeline: solution.timeline, keyEvidenceIds: solution.keyEvidenceIds, redHerringExplanations: solution.redHerringExplanations, solutionExplanation: solution.solutionExplanation };
    const saved = await CaseModel.updateOne({ _id: record._id, status: 'READY' }, { $set: { status: 'SOLVED', result } });
    if (saved.modifiedCount === 1) return res.json(result);
    const latest = await CaseModel.findById(record._id);
    if (latest?.status === 'SOLVED' && (latest as any).result?.selectedSuspectId === suspectId) return res.json((latest as any).result);
    return res.status(409).json({ error: { code: 'ALREADY_SOLVED', message: 'An accusation has already been submitted for this case.' } });
  } catch (error) { next(error); }
});

// In production, Express serves the Vite build as well as the API so one
// Render web service can host the complete application on the free plan.
if (process.env.NODE_ENV === 'production') {
  const clientBuild = fileURLToPath(new URL('../../client/dist/', import.meta.url));
  app.use(express.static(clientBuild));
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api/')) return next();
    return res.sendFile(resolve(clientBuild, 'index.html'));
  });
}

app.use((error: any, _req: any, res: any, _next: any) => {
  console.error('API error:', error?.message || error);
  res.status(500).json({ error: { code: 'INTERNAL_ERROR', message: 'Something went wrong. Please try again.' } });
});
