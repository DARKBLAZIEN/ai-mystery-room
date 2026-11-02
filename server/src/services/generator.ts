import { GoogleGenAI } from '@google/genai';
import { GeneratedCaseSchema, type CreateCaseInput } from '@mystery-room/shared';
import { env } from '../config/env.js';

function demo(input:CreateCaseInput){
 const ids=['mara','theo','ines','felix','nora','owen'].slice(0,input.suspectCount); const names=['Mara Voss','Theo Bell','Ines Park','Felix Grant','Nora Vale','Owen Reed'];
 const suspects=ids.map((id,i)=>({id,name:names[i],age:31+i*4,occupation:['curator','night guard','archivist','restoration artist','donor','technician'][i],relationship:['Head curator','Night security lead','Collections archivist','Visiting conservator','Gallery benefactor','Facilities technician'][i],background:`${names[i]} has worked around the Halcyon Gallery for years and had access to the east wing. Their recent history gives investigators a reason to ask questions.`,publicStatement:['I locked the east gallery at nine. Nobody was supposed to go back in.','I made my final patrol before ten; the service corridor was quiet.','I was cataloguing in the archive until the alarm sounded.','I left the restoration room before the storm began.','I attended the reception and never entered the east wing.','I was checking the backup power in the basement.'][i]}));
 const suspect=(id:string)=>suspects.find(s=>s.id===id)?.name||names[0];
 const evidence=[
 {id:'msg-01',title:'The Midnight Exchange',type:'messages',description:'A recovered fictional message thread from the gallery team.',timestamp:'2026-10-31T21:42:00Z',associatedSuspectIds:['mara','ines'],content:{participants:[suspect('mara'),suspect('ines')],messages:[{sender:suspect('mara'),text:'Did you move the blue folder from the east desk?',time:'21:42'},{sender:suspect('ines'),text:'No. The inventory photo still has it there at 9:30.',time:'21:44'},{sender:suspect('mara'),text:'Then the camera clock is seven minutes fast again.',time:'21:47'}]},internalExplanation:'The clock discrepancy connects the camera and inventory photo; Mara knows the camera offset.',classification:'clue'},
 {id:'img-01',title:'The East Desk Photograph',type:'image',description:'A documented scene detail, reconstructed as an illustrative evidence card.',timestamp:'2026-10-31T21:30:00Z',associatedSuspectIds:['mara','ines'],content:{scene:'An orderly conservation desk, a blue folder beside a brass lamp, rain on the narrow window.',observations:['The folder is present in the 9:30 inventory image.','A clean rectangular dust mark suggests it was moved after the photograph.'],label:'Illustrative reconstruction — not a generated photograph'},internalExplanation:'The folder was present at 9:30 and moved after; narrows the timeline.',classification:'corroboration'},
 {id:'cctv-01',title:'East Corridor — Camera 04',type:'cctv',description:'Simulated still-frame recording. Camera clock runs seven minutes fast.',timestamp:'2026-10-31T22:00:00Z',associatedSuspectIds:['mara','theo'],content:{camera:'CAM-04 / EAST CORRIDOR',frames:[{at:'00:00',caption:'Empty corridor; rain flashes against the frosted glass.'},{at:'00:08',caption:`A figure matching ${suspect('mara')}'s height enters from the archive passage.`},{at:'00:18',caption:'The figure leaves carrying a slim rectangular object.'},{at:'00:31',caption:'The night guard passes in the opposite direction.'}],duration:38,offsetMinutes:7},internalExplanation:'Corrected camera time is 21:53; Mara enters the archive passage carrying the folder.',classification:'clue'},
 {id:'wit-01',title:'Statement: The Conservator',type:'witness',description:'Interview transcript recorded the morning after the incident.',timestamp:'2026-11-01T08:15:00Z',associatedSuspectIds:[ids.includes('felix')?'felix':'ines','mara'],content:{witness:suspect(ids.includes('felix')?'felix':'ines'),interviewedAt:'08:15',statement:'I left at 9:40. From the front steps I saw Mara return through the side entrance just before ten. She said she had forgotten her notebook.'},internalExplanation:'Places Mara back inside during the window, contrary to her claim she locked up and left.',classification:'clue'},
 {id:'time-01',title:'Door Access Log',type:'timeline',description:'Electronic access events for the east wing and archive passage.',timestamp:'2026-10-31T21:00:00Z',associatedSuspectIds:['mara','theo','ines'],content:{events:[{time:'21:30',event:'Inventory photograph taken; blue folder on desk.'},{time:'21:47',event:'East wing lock engaged with curator override.'},{time:'21:53',event:'CAM-04 records a figure entering (corrected from 22:00).'}, {time:'22:04',event:'Gallery alarm triggered; east wing opened by security.'}]},internalExplanation:'Places the removal after 21:30 and before 22:04; curator override is tied to Mara.',classification:'corroboration'},
 {id:'note-01',title:'The Rain-Soaked Note',type:'image',description:'A note found beside the public entrance.',timestamp:'2026-10-31T22:10:00Z',associatedSuspectIds:['theo'],content:{scene:'A damp handwritten note reads “Meet me by the loading bay. Bring the ledger.”',label:'Illustrative reconstruction',observations:['The note is unsigned.','The ink is smeared by rain.']},internalExplanation:'A misleading clue implicating the guard; it concerns an unrelated delivery and does not place him in the wing.',classification:'red-herring'}
 ];
 return {publicCase:{title:'The Blue Folder at Halcyon',introduction:`${input.scenario}\n\nDuring a stormy opening night, a sealed conservation ledger vanished from the east gallery. The wing was locked, the alarm sounded at 10:04 PM, and several people had access. Reconstruct the final half hour and determine who removed it.`,location:'Halcyon Gallery, East Wing',incidentTime:'2026-10-31T22:04:00Z',caseType:input.caseType==='Any Mystery'?'Theft or robbery':input.caseType,difficulty:input.difficulty,suspects},solution:{culpritId:'mara',motive:'Mara altered the conservation records to conceal an unauthorized sale and removed the ledger before an audit.',method:'She used the curator override to re-enter through the archive passage and carried the slim ledger out during the storm.',incidentSummary:'The sealed conservation ledger was removed from the east desk between 9:30 and 10:04 PM.',timeline:[{time:'21:30',event:'Inventory photograph shows the ledger on the desk.',involvedSuspectIds:['mara','ines']},{time:'21:47',event:'Curator override unlocks the east wing.',involvedSuspectIds:['mara']},{time:'21:53',event:'Mara enters on corrected camera footage and leaves with the ledger.',involvedSuspectIds:['mara']},{time:'22:04',event:'Alarm reveals the ledger is missing.',involvedSuspectIds:['theo']}],requiredFacts:['The ledger remained on the desk at 21:30.','Camera 04 runs seven minutes fast.','Mara returned after saying she had left.'],keyEvidenceIds:['msg-01','cctv-01','wit-01','time-01'],redHerringExplanations:['The unsigned loading-bay note concerned an unrelated delivery; it does not put Theo in the east wing.'],solutionExplanation:'The inventory image establishes that the ledger was present at 9:30. The access log and corrected Camera 04 footage place a curator override and a figure carrying a slim object at 9:53. Felix saw Mara return after she claimed to have left, while the message thread shows she knew the camera clock was seven minutes fast. Together, those independent clues identify Mara and explain the timing.'},evidence};
}
function validateCase(data: ReturnType<typeof GeneratedCaseSchema.parse>, input: CreateCaseInput) {
 const suspectIds = data.publicCase.suspects.map((s) => s.id);
 const evidenceIds = data.evidence.map((e) => e.id);
 const fail = (reason: string): never => { throw new Error(`Case quality check failed: ${reason}`); };
 if (suspectIds.length !== input.suspectCount) fail('wrong suspect count');
 if (new Set(suspectIds).size !== suspectIds.length || new Set(evidenceIds).size !== evidenceIds.length) fail('duplicate suspect or evidence IDs');
 if (!suspectIds.includes(data.solution.culpritId)) fail('culprit does not match a suspect');
 if (data.evidence.length < 6 || data.evidence.length > 10) fail('evidence count must be 6–10');
 if (!['messages','image','cctv','witness','timeline'].every((type) => data.evidence.some((e) => e.type === type))) fail('a required evidence type is missing');
 if (data.evidence.some((e) => e.associatedSuspectIds.some((id) => !suspectIds.includes(id)))) fail('evidence refers to an unknown suspect');
 if (data.solution.timeline.some((t) => t.involvedSuspectIds.some((id) => !suspectIds.includes(id)))) fail('timeline refers to an unknown suspect');
 if (data.solution.keyEvidenceIds.some((id) => !evidenceIds.includes(id))) fail('solution refers to missing evidence');
 const independentClues = data.evidence.filter((e) => ['clue','corroboration'].includes(e.classification) && e.associatedSuspectIds.includes(data.solution.culpritId));
 if (independentClues.length < 2) fail('fewer than two independent clues support the culprit');
 if (!data.evidence.some((e) => e.classification === 'red-herring') || !data.solution.redHerringExplanations.length) fail('a red herring needs a resolution');
 if (data.solution.requiredFacts.length < 2) fail('the solution needs at least two required facts');
 for (const item of data.evidence) if (Number.isNaN(Date.parse(item.timestamp))) fail('evidence contains an invalid timestamp');
 return data;
}
export class TemporaryProviderError extends Error {
  constructor() {
    super('The AI provider is temporarily unavailable. Please wait a minute and try again.');
    this.name = 'TemporaryProviderError';
  }
}

const generatedCaseResponseSchema = {
  type: 'object',
  properties: {
    publicCase: {
      type: 'object',
      properties: {
        title: { type: 'string' },
        introduction: { type: 'string' },
        location: { type: 'string' },
        incidentTime: { type: 'string' },
        caseType: { type: 'string' },
        difficulty: { type: 'string', enum: ['Easy', 'Medium', 'Hard'] },
        suspects: {
          type: 'array',
          minItems: 3,
          items: {
            type: 'object',
            properties: {
              id: { type: 'string' },
              name: { type: 'string' },
              age: { type: 'integer' },
              occupation: { type: 'string' },
              relationship: { type: 'string' },
              background: { type: 'string' },
              publicStatement: { type: 'string' }
            },
            required: ['id', 'name', 'age', 'occupation', 'relationship', 'background', 'publicStatement'],
            additionalProperties: false
          }
        }
      },
      required: ['title', 'introduction', 'location', 'incidentTime', 'caseType', 'difficulty', 'suspects'],
      additionalProperties: false
    },
    solution: {
      type: 'object',
      properties: {
        culpritId: { type: 'string' },
        motive: { type: 'string' },
        method: { type: 'string' },
        incidentSummary: { type: 'string' },
        timeline: {
          type: 'array',
          items: {
            type: 'object',
            properties: {
              time: { type: 'string' },
              event: { type: 'string' },
              involvedSuspectIds: { type: 'array', items: { type: 'string' } }
            },
            required: ['time', 'event', 'involvedSuspectIds'],
            additionalProperties: false
          }
        },
        requiredFacts: { type: 'array', minItems: 2, items: { type: 'string' } },
        keyEvidenceIds: { type: 'array', minItems: 2, items: { type: 'string' } },
        redHerringExplanations: { type: 'array', minItems: 1, items: { type: 'string' } },
        solutionExplanation: { type: 'string' }
      },
      required: ['culpritId', 'motive', 'method', 'incidentSummary', 'timeline', 'requiredFacts', 'keyEvidenceIds', 'redHerringExplanations', 'solutionExplanation'],
      additionalProperties: false
    },
    evidence: {
      type: 'array',
      minItems: 6,
      maxItems: 10,
      items: {
        type: 'object',
        properties: {
          id: { type: 'string' },
          title: { type: 'string' },
          type: { type: 'string', enum: ['messages', 'image', 'cctv', 'witness', 'timeline'] },
          description: { type: 'string' },
          timestamp: { type: 'string' },
          associatedSuspectIds: { type: 'array', items: { type: 'string' } },
          content: { type: 'object', additionalProperties: true },
          internalExplanation: { type: 'string' },
          classification: { type: 'string', enum: ['clue', 'red-herring', 'corroboration', 'context'] }
        },
        required: ['id', 'title', 'type', 'description', 'timestamp', 'associatedSuspectIds', 'content', 'internalExplanation', 'classification'],
        additionalProperties: false
      }
    }
  },
  required: ['publicCase', 'solution', 'evidence'],
  additionalProperties: false
};

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms));
const isTransientProviderFailure = (error: unknown) =>
  /\b(408|429|500|502|503|504)\b|UNAVAILABLE|RESOURCE_EXHAUSTED|fetch failed|ECONNRESET|ETIMEDOUT|EAI_AGAIN/i
    .test(error instanceof Error ? error.message : String(error));

export async function generateCase(input: CreateCaseInput) {
  if (!env.geminiKey) {
    if (env.demoMode) return validateCase(GeneratedCaseSchema.parse(demo(input)), input);
    throw new Error('AI case generation needs a valid GEMINI_API_KEY. The built-in demo is a fixed sample and does not adapt to the submitted story.');
  }

  const ai = new GoogleGenAI({ apiKey: env.geminiKey });
  const models = [...new Set([env.geminiModel, env.geminiFallbackModel])];
  let last: unknown;
  let lastWasTransient = false;

  for (const [modelIndex, model] of models.entries()) {
    const attempts = modelIndex === 0 ? env.retries + 1 : 1;
    for (let attempt = 0; attempt < attempts; attempt++) {
      try {
        const repair = last ? `Previous attempt failed: ${String(last)}. Correct the issue.` : '';
        const prompt = `Build a fair, solvable fictional mystery from the player's story below. The player's story is the source of truth: preserve its people, relationships, event, setting, and important details. Do not replace it with a generic gallery, hotel, or unrelated scenario. Expand gaps creatively, but do not contradict supplied details. Make the title, introduction, suspects, motive, method, timeline, and every evidence item specific to this story. The introduction should say what happened and what the investigator must solve without revealing the culprit. Return ONLY valid JSON matching: {publicCase:{title:string,introduction:string,location:string,incidentTime:string ISO,caseType:string,difficulty:string,suspects:[{id:string,name:string,age:number,occupation:string,relationship:string,background:string,publicStatement:string}]},solution:{culpritId:string,motive:string,method:string,incidentSummary:string,timeline:[{time:string,event:string,involvedSuspectIds:string[]}],requiredFacts:string[],keyEvidenceIds:string[],redHerringExplanations:string[],solutionExplanation:string},evidence:[{id:string,title:string,type:'messages'|'image'|'cctv'|'witness'|'timeline',description:string,timestamp:string ISO,associatedSuspectIds:string[],content:object,internalExplanation:string,classification:'clue'|'red-herring'|'corroboration'|'context'}]}. Make exactly ${input.suspectCount} suspects with unique short IDs. Include 6-10 evidence items, at least one of each evidence type, two independent clues supporting the culprit, and a red herring that is explicitly resolved. Keep all IDs consistent. Content shapes: messages {participants:string[],messages:[{sender:string,text:string,time:string}]}; CCTV {camera:string,frames:[{at:string,caption:string}],duration:number,offsetMinutes:number}; witness {witness:string,interviewedAt:string,statement:string}; timeline {events:[{time:string,event:string}]}; image {scene:string,label:string,observations:string[]}. ${repair}\nPLAYER'S STORY (follow closely):\n${input.scenario}\n\nCase type: ${input.caseType}. Difficulty: ${input.difficulty}.`;
        const response = await ai.models.generateContent({
          model,
          contents: prompt,
          config: {
            responseMimeType: 'application/json',
            responseJsonSchema: generatedCaseResponseSchema,
            maxOutputTokens: 32768
          }
        });
        const raw = response.text || '';
        const finishReason = response.candidates?.[0]?.finishReason;
        let parsed: unknown;
        try {
          parsed = JSON.parse(raw.replace(/^```json\s*/, '').replace(/```$/, ''));
        } catch (error) {
          const parseMessage = error instanceof Error ? error.message : 'invalid JSON';
          throw new Error(`Gemini returned invalid JSON (${raw.length} characters, finish reason: ${finishReason || 'unknown'}): ${parseMessage}`);
        }
        return validateCase(GeneratedCaseSchema.parse(parsed), input);
      } catch (error) {
        last = error instanceof Error ? error.message : 'invalid output';
        lastWasTransient = isTransientProviderFailure(error);
        if (attempt < attempts - 1) {
          const backoffMs = Math.min(8000, 1000 * 2 ** attempt) + Math.random() * 300;
          await delay(backoffMs);
        }
      }
    }
    if (modelIndex < models.length - 1) {
      console.warn(`Gemini model ${model} did not produce a valid case; trying fallback model ${models[modelIndex + 1]}.`);
    }
  }

  console.error('Gemini case generation failed after retries and fallback:', last);
  if (lastWasTransient) throw new TemporaryProviderError();
  throw new Error('Gemini could not produce a valid case. Check the server log for the provider or validation error.');
}
