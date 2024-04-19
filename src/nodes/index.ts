import { Node } from 'reactflow';
import { AddUser, GetOrg, GetUser, Process } from './types';
import { TimeScale } from '../core/time';
import '../index.css'
import {Direction as CallDirection} from './types'

const addUserClient : Process = {
  nodeId: 'p1',
  displayName : 'Add User',
  key : AddUser,
  memory: 100,
  time: 5,
  storage : 0,
  subProcess: [
    {
      query: AddUser,
      direction: CallDirection.DOWN
    }
  ]
}

const addUserProcess : Process = {
  nodeId: 'p2',
  displayName : 'Add User',
  key : AddUser,
  memory: 100,
  storage : 0,
  time: 5,
  subProcess: [
    {
      query: GetOrg,
      direction: CallDirection.RIGHT
    },
    {
      query: AddUser,
      direction: CallDirection.DOWN
    }
  ]
}

const getOrgProcess : Process = {
  displayName : 'Get Org',
  key : GetOrg,
  memory: 100,
  time: 5,
  storage : 0,
  subProcess: [
    {
      query: GetOrg,
      direction: CallDirection.DOWN
    }
  ]
}

const getOrgDatabaseProcess : Process = {
  displayName : 'Get Org',
  key : GetOrg,
  memory: 0,
  time: 5,
  storage : 0,
  subProcess: []
}
  
const addUserDatabase : Process = {
  displayName : 'Add User',
  key : AddUser,
  memory: 0,
  storage : 100,
  time: 5,
  subProcess: []
}


const orgProcessDataEmpty = {
  displayName: 'Get Org',
  key : GetOrg,
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
    id: 's1',
    type: NodeType.SERVER,
    position: { x: 0, y: -100 },
    className: 'componentBorder server'
  },
  {
    id: 'p1',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's1',
    extent: 'parent',
  },

  {
    id: 's2',
    type: NodeType.SERVER,
    position: { x: 0, y: 225 },
    className: 'componentBorder server'
  },
  {
    id: 'p2',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's2',
    extent: 'parent',
  },
  {
    id: 's3',
    type: NodeType.SERVER,
    position: { x: 400, y: 225 },
    className: 'componentBorder server'
  },
  {
    id: 'p3',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's3',
    extent: 'parent',
  },
  {
    id: 's4',
    type: NodeType.SERVER,
    position: { x: 0, y: 525 },
    className: 'componentBorder server'
  },
  {
    id: 'p4',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's4',
    extent: 'parent',
  },
] as Node[];
