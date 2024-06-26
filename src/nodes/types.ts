export const AddUser = 'addUser'
export const GetUser = 'getUser'
export const GetOrg = 'getOrg'

export enum Direction {
    UP = 'up',
    DOWN = 'down',
    LEFT = 'left',
    RIGHT = 'right'
}

export enum ThreadStatus {
    WAITING = 'waiting',
    RUNNING = 'running',
}

interface SpawnThread {
    msBetweenSpawns : number,
    maxSpawns : number,
    totalSpawns : number
}

export interface Thread {
    threadID: number,
    callingThreadId : number | null,
    status : ThreadStatus,
    programCounter : number,
    processId : string
    
}

export interface Process {
    //The name of the process
    displayName: string
    //Edges invoke this process via this key
    key : string,
    //the id of the process
    id : string,
    // The amount of memory the process takes on the node
    memory: number
    // the persisted storage the process takes on the node
    storage: number
    //The time it takes for the process to run
    time: number,

    //id of the parent node
    parentNode: string,
    subProcess: {
        query: string
        direction: Direction

    }[]
    spawnInfo : SpawnThread | null
}

export enum NodeType {
    CLIENT = 'client',
    SERVER = 'server',
    DATABASE = 'database',
    PROCESS = 'process'
  }



  export interface NodeData {
    displayName: string
  }