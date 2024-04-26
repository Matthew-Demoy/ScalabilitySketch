import { NodeData, NodeType } from "../../nodes/types";
import { Node } from 'reactflow';

const ServerOne : Node<NodeData>= {
    id: 's1',
    type: NodeType.SERVER,
    position: { x: 0, y: -100 },
    className: 'componentBorder server',
    data : {
        displayName : 'Client'        
    }
}

const ProcessOne : Node = {
    id: 'p1',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's1',
    extent: 'parent',
    data: undefined,
}


const ServerTwo : Node<NodeData>=     {
    id: 's2',
    type: NodeType.SERVER,
    position: { x: 0, y: 225 },
    className: 'componentBorder server',
    data : {
        displayName : 'User Service'        
    }
}

const ProcessTwo = 
{
    id: 'p2',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's2',
    extent: 'parent',
}

const ServerThree : Node<NodeData> = {
    id: 's3',
    type: NodeType.SERVER,
    position: { x: 400, y: 225 },
    className: 'componentBorder server',
    data : {
        displayName : 'Org Service'        
    }
}

const ProcessThree = {
    id: 'p3',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's3',
    extent: 'parent',
}

const ServerFour : Node<NodeData> = {
    id: 's4',
    type: NodeType.SERVER,
    position: { x: 0, y: 525 },
    className: 'componentBorder server',
    data : {
        displayName : 'User Database'        
    }
}

const ProcessFour = {
    id: 'p4',
    type: NodeType.PROCESS,
    position: { x: 20, y: 60 },
    parentNode: 's4',
    extent: 'parent',
}


const nodes = [ServerOne, ServerTwo, ServerThree, ServerFour] as Node<NodeData>[]
export default nodes    
export {ServerOne, ProcessOne, ServerTwo, ProcessTwo, ServerThree, ProcessThree, ServerFour, ProcessFour}