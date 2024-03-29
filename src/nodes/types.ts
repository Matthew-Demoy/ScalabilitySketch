import {    
    Node,    
} from 'reactflow';


export enum TaskStatus {
    PROCESS_IN,
    WAITING,
    PROCESS_OUT
}
interface Task {
    id : number
    t : number
    status : TaskStatus
}

interface NodeCommon {
    tasks : Map<number, Task>
}
interface SpawnNodeData extends NodeCommon {
    spawnRate: number
}

type SpawnNode = Node<SpawnNodeData>;

const isSpawnNode = (node: Node<NodeData>): node is SpawnNode => {
    return node.type === 'faucet';
};

interface PipeData extends NodeCommon {
    rate: number
    latency: number    
}
type PipeNode = Node<PipeData>;

const isPipeNode = (node: Node<NodeData>): node is PipeNode => {
    return node.type === 'pipe';
};

interface EndNodeData extends NodeCommon {
    total: number
}

export type NodeData = SpawnNodeData | PipeData | EndNodeData

export { isSpawnNode, isPipeNode };
export type { SpawnNodeData, PipeData, EndNodeData };
