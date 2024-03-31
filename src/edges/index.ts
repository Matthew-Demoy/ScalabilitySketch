import { Edge } from 'reactflow';
import { Direction, EdgeData, Message } from './types';

const edge1_2Data : EdgeData = { messages: new Map<number, Message>(), latency : 2}
const edge2_3Data : EdgeData = { messages: new Map<number, Message>(), latency : 2}

//edge2_3Data.messages.set(130, {t: 0, id: 1000, direction: Direction.SOURCE})
//edge2_3Data.messages.set(131, {t: 1, id: 1000, direction: Direction.SOURCE})
//edge2_3Data.messages.set(132, {t: 2, id: 1000, direction: Direction.SOURCE})

//edge2_3Data.messages.set(11, {t: 0, id: 1000, direction: Direction.TARGET})
//edge2_3Data.messages.set(12, {t: 1, id: 1000, direction: Direction.TARGET})
//edge2_3Data.messages.set(13, {t: 1, id: 1000, direction: Direction.TARGET})

export default [
  { id: 'e1-2', source: '1', target: '2', type: "transfer", data: edge1_2Data},
  { id: 'e2-3', source: '2', target: '3', type: "transfer", data: edge2_3Data},
] as  Edge[];
