import { Node } from 'reactflow';
import { SpawnNodeData, PipeData, EndNodeData } from './types';

const spawnNodeData : SpawnNodeData =  { spawnRate: 1, tasks: new Map()}
const pipeNodeData : PipeData = { rate: 1, latency : 1,  tasks: new Map()}
const endNodeData : EndNodeData = { total: 0,  tasks: new Map()}

export default [
  {
    id: '1',
    type: 'faucet',
    data: spawnNodeData,
    position: { x: 0, y: -100 },
  },

  {
    id: '2',
    type: 'pipe',
    data: pipeNodeData,
    position: { x: 0, y: 125 },
  },
  {
    id: '3',
    type: 'end',
    data: endNodeData,
    position: { x: 0, y: 450 },
  },
] as Node[];
