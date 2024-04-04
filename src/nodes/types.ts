import {    
    Node,    
} from 'reactflow';
import { TimeScale } from '../core/time';
import { NodeType } from '.';


export enum TaskStatus {
    PROCESS_IN,
    WAITING,
    PROCESS_OUT
}

export interface TaskMetadata {
    // Effect of storage in bytes
    storage?: number,
    bandwidth?: number,

    // Effect of time in ms
    time : number
}

export enum Component {
    DATABASE = 'database',
    SERVER = 'server',
    CLIENT_CALL = 'client_call',
    SERVER_RESPONSE = 'server_response',
    DATABASE_RESPONSE = 'database_response',
    CLIENT = 'client'
}

export const AddUser = 'addUser'


type TaskData = Map<Component, TaskMetadata>

export type TaskLibrary = Map<string, TaskData>

const addUser: TaskData = new Map([
    [Component.DATABASE, { storage: 100, time: 10 * TimeScale.MILLISECOND }],
    [Component.SERVER, { time: 1 * TimeScale.MILLISECOND   }],
    [Component.CLIENT_CALL, { time: 10 * TimeScale.MILLISECOND  }],
    [Component.SERVER_RESPONSE, { time: 10  * TimeScale.MILLISECOND  }],
    [Component.DATABASE_RESPONSE, { time: 10 * TimeScale.MILLISECOND  }]
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
interface ClientData extends NodeCommon {
    spawnRate: number
}

type Client = Node<ClientData>;

const isClient = (node: Node<NodeData>): node is Client => {
    return node.type === NodeType.CLIENT;
};

interface ServerData extends NodeCommon {
    latency: number    
}
type PipeNode = Node<ServerData>;

const isPipeNode = (node: Node<NodeData>): node is PipeNode => {
    return node.type === NodeType.SERVER;
};

interface DatabaseData extends NodeCommon {
    total: number
}

type EndNode = Node<DatabaseData>;

const isEndNode = (node: Node<NodeData>): node is EndNode => {
    return node.type === NodeType.DATABASE;
}


export type NodeData = ClientData | ServerData | DatabaseData

export { isClient, isPipeNode, isEndNode };
export type { ClientData, ServerData, DatabaseData, Task };
