import { Edge } from 'reactflow';
import { EdgeData } from './types';

const edge1_2Data : EdgeData = { messages: [], latency : 4}
const edge2_3Data : EdgeData = { messages: [], latency : 4}

export default [
  { id: 'e1-2', source: '1', target: '2', type: "transfer", data: edge1_2Data},
  { id: 'e2-3', source: '2', target: '3', type: "transfer", data: edge2_3Data},
] as  Edge[];
