import { NodeType } from "../../nodes/types";
import { Node } from 'reactflow';

const ServerOne = {
    id: 's1',
    type: NodeType.SERVER,
    position: { x: 0, y: -100 },
    className: 'componentBorder server'
}

const ProcessOne = {
    id: 'p1',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's1',
    extent: 'parent',
}


const ServerTwo =     {
    id: 's2',
    type: NodeType.SERVER,
    position: { x: 0, y: 225 },
    className: 'componentBorder server'
}

const ProcessTwo = 
{
    id: 'p2',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's2',
    extent: 'parent',
}

const ServerThree = {
    id: 's3',
    type: NodeType.SERVER,
    position: { x: 400, y: 225 },
    className: 'componentBorder server'
}

const ProcessThree = {
    id: 'p3',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's3',
    extent: 'parent',
}

const ServerFour = {
    id: 's4',
    type: NodeType.SERVER,
    position: { x: 0, y: 525 },
    className: 'componentBorder server'
}

const ProcessFour = {
    id: 'p4',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's4',
    extent: 'parent',
}


const nodes = [ServerOne, ProcessOne, ServerTwo, ProcessTwo, ServerThree, ProcessThree, ServerFour, ProcessFour] as Node[]
export default nodes    
export {ServerOne, ProcessOne, ServerTwo, ProcessTwo, ServerThree, ProcessThree, ServerFour, ProcessFour}