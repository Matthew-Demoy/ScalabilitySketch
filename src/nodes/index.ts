import { Node } from 'reactflow';
import { AddUser, ClientData, Component, DatabaseData, GetUser, ServerData } from './types';
import { TimeScale } from '../core/time';

const spawnNodeData : ClientData =  {
  tasks: new Map(),
  features : {
    [AddUser]: {
      callsPerDay : 86400000000 / 200
    },
    [GetUser]: {
      callsPerDay : 86400000000
    },
  },
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
  DATABASE = 'database',
  PROCESS = 'process'
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
  {
    id: '4',
    type: NodeType.PROCESS,
    data: pipeNodeData,
    position: { x: 0, y: 0 },
    parentNode: '2',
    extent: 'parent',
  },
] as Node[];
