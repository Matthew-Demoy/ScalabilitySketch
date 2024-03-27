import { Node } from 'reactflow';

export default [
  {
    id: '1',
    type: 'faucet',
    data: { spawnRate: 1 },
    position: { x: 250, y: 25 },
  },

  {
    id: '2',
    type: 'pipe',
    data: { rate: 1},
    position: { x: 100, y: 125 },
  },
  {
    id: '3',
    type: 'end',
    data: { total: 0},
    position: { x: 250, y: 250 },
  },
] as Node[];
