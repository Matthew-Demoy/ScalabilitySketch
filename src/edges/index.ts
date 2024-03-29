import { Edge } from 'reactflow';
import { EdgeData, Message } from './types';

const edge1_2Data : EdgeData = { messages: new Map<number, Message>(), latency : 2}
const edge2_3Data : EdgeData = { messages: new Map<number, Message>(), latency : 2}

export default [
  { id: 'e1-2', source: '1', target: '2', type: "transfer", data: edge1_2Data},
  { id: 'e2-3', source: '2', target: '3', type: "transfer", data: edge2_3Data},
] as  Edge[];
