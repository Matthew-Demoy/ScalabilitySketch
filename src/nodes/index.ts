import { Node } from 'reactflow';
import { AddUser, ClientData, Component, DatabaseData, GetUser, ProcessData, ServerData } from './types';
import { TimeScale } from '../core/time';
import '../index.css'
import {Direction as CallDirection} from './types'

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

export const processNodeData : ProcessData = {
  name: 'Add User',
  memory: 100,
  time: 100,  
  calls: [
    {
      query: 'addUser',
      direction: CallDirection.DOWN
    }
  ],
  processes: new Map()
}

export const orgProcessNodeData : ProcessData = {
  name: 'Get Org',
  memory: 100,
  time: 100,  
  calls: [
    {
      query: 'getOrg',
      direction: CallDirection.DOWN
    }
  ],
  processes: new Map()
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
    className: 'componentBorder server'
  },
  {
    id: '3',
    type: NodeType.DATABASE,
    data: endNodeData,
    position: { x: 0, y: 450 },
  },

  {
    id: '5',
    type: NodeType.SERVER,
    data: pipeNodeData,
    position: { x: 250, y: 125 },
    className: 'componentBorder server'
  },
  {
    id: '6',
    type: NodeType.DATABASE,
    data: endNodeData,
    position: { x: 250, y: 450 },
  },
  {
    id: '7',
    type: NodeType.PROCESS,
    data: processNodeData,
    position: { x: 20, y: 60 },
    parentNode: '2',
    extent: 'parent',
  },
  {
    id: '8',
    type: NodeType.PROCESS,
    data: orgProcessNodeData,
    position: { x: 20, y: 60 },
    parentNode: '5',
    extent: 'parent',
  },
] as Node[];
