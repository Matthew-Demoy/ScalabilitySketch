import { Node } from 'reactflow';
import { ClientData, Component, DatabaseData, ServerData } from './types';
import { TimeScale } from '../core/time';

const spawnNodeData : ClientData =  {
  spawnRate: 86400000000 / 1000 / 10, tasks: new Map(),
  componentName: Component.CLIENT
}
const pipeNodeData : ServerData = {
  tasks: new Map(),
  componentName: Component.SERVER,
  latency: 50 * TimeScale.MICROSECOND
}
const endNodeData : DatabaseData = {
  tasks: new Map(),
  componentName: Component.DATABASE,
  total: 0
}

export enum NodeType {
  CLIENT = 'client',
  SERVER = 'server',
  DATABASE = 'database'
}

export default [
  {
    id: '1',
    type: NodeType.CLIENT,
    data: spawnNodeData,
    position: { x: 0, y: -100 },
  },

  {
    id: '2',
    type: NodeType.SERVER,
    data: pipeNodeData,
    position: { x: 0, y: 125 },
  },
  {
    id: '3',
    type: NodeType.DATABASE,
    data: endNodeData,
    position: { x: 0, y: 450 },
  },
] as Node[];
