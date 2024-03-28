import { Edge } from 'reactflow';
import { EdgeData } from '../store/store';

type OurEdge = Edge & {
  data: EdgeData;
};

export default [
  { id: 'e1-2', source: '1', target: '2', type: "transfer", data: {latency : 4, packets:[]}},
  { id: 'e2-3', source: '2', target: '3', type: "transfer", data: {latency : 4, packets:[]}},
] as  OurEdge[];
