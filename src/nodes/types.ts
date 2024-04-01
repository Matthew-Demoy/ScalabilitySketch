import {    
    Node,    
} from 'reactflow';


export enum TaskStatus {
    PROCESS_IN,
    WAITING,
    PROCESS_OUT
}

interface TaskMetadata {
    // Effect of storage in bytes
    storage?: number,
    bandwidth?: number,

    // Effect of time in ms
    time : number
}

export enum Component {
    DATABASE,
    SERVER,
    CLIENT_CALL,
    SERVER_RESPONSE,
    DATABASE_RESPONSE
}

export const AddUser = 'addUser'


type TaskData = Map<Component, TaskMetadata>

type TaskLibrary = Map<string, TaskData>

const addUser: TaskData = new Map([
    [Component.DATABASE, { storage: 100, time: 10 }],
    [Component.SERVER, { time: 1 }],
    [Component.CLIENT_CALL, { time: 10 }],
    [Component.SERVER_RESPONSE, { time: 10 }],
    [Component.DATABASE_RESPONSE, { time: 10 }]
]);

export const TemplateLibrary : TaskLibrary = new Map<string, TaskData>(
    [
        [AddUser, addUser]
    ]
)

interface Task {
    //The unique ID to indentify the task
    //Think of it as the process id that would live on each machine to perform the task
    id : number
    //The elapsed time (t) in ms
    t : number
    //The status of the task, simulates call response of http
    status : TaskStatus

    //The name of the templated task to be looked up in the library
    templateName : string
}

interface NodeCommon {
    tasks : Map<number, Task>
    componentName : Component
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

type EndNode = Node<EndNodeData>;

const isEndNode = (node: Node<NodeData>): node is EndNode => {
    return node.type === 'end';
}


export type NodeData = SpawnNodeData | PipeData | EndNodeData

export { isSpawnNode, isPipeNode, isEndNode };
export type { SpawnNodeData, PipeData, EndNodeData, Task };
