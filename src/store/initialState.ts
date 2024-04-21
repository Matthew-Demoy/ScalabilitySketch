import { AddUser, Direction, GetOrg, Process, Thread, ThreadStatus } from "../nodes/types"

const addUserClient : Process = {
    nodeId: 'p1',
    id : 'p1',
    displayName : 'Add User',
    key : AddUser,
    memory: 100,
    time: 5,
    storage : 0,
    subProcess: [
      {
        query: AddUser,
        direction: Direction.DOWN
      }
    ],
    spawnInfo : {
      msBetweenSpawns: 1,
      maxSpawns: 3,
      totalSpawns: 0
    }
  }
  
  const addUserProcess : Process = {
    nodeId: 'p2',
    displayName : 'Add User',
    id : 'p2',
    key : AddUser,
    memory: 100,
    storage : 0,
    time: 5,
    subProcess: [

    ],
    spawnInfo : null
  }

  const getOrgProcess : Process = {
    nodeId: 'p3',
    id : 'p3',
    displayName : 'Get Org',
    key : GetOrg,
    memory: 100,
    time: 5,
    storage : 0,
    subProcess: [
    ],
    spawnInfo : null
  }

  const addUserDatabase : Process = {
    nodeId: 'p4',
    id : 'p4',
    displayName : 'Persist User',
    key : AddUser,
    memory: 100,
    time: 5,
    storage : 500,
    subProcess: [      
    ],
    spawnInfo : null
  }


  
export const defaultProcesses = [ addUserClient, addUserProcess, getOrgProcess, addUserDatabase]

const thread : Thread = {
    threadID: 1,
    status: ThreadStatus.RUNNING,
    programCounter: 0,
    processId: 'p1',
    callingThreadId: null,
}

export const defaultThreads = []