import { Node } from 'reactflow';
import '../index.css'

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
