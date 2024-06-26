import { AddUser, Direction, GetOrg, Process, Thread, ThreadStatus } from "../../nodes/types"
import { InitialState } from "../store"

const addUserClient : Process = {
  id: 'p1',
  displayName: 'Add User',
  key: AddUser,
  memory: 100,
  time: 5,
  storage: 0,
  subProcess: [
    {
      query: AddUser,
      direction: Direction.DOWN
    }
  ],
  spawnInfo: {
    msBetweenSpawns: 1,
    maxSpawns: 3,
    totalSpawns: 0
  },
  parentNode: "s1"
}
  
  const addUserProcess : Process = {
    parentNode: 's2',
    displayName : 'Add User',
    id : 'p2',
    key : AddUser,
    memory: 100,
    storage : 0,
    time: 5,
    subProcess: [
      {
        query: GetOrg,
        direction: Direction.RIGHT
      },
      {
        query: AddUser,
        direction: Direction.DOWN
      }
    ],
    spawnInfo : null
  }

  const getOrgProcess : Process = {
    parentNode: 's3',
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
    parentNode: 's4',
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


const singleThread : InitialState = {

}


const initialStates : InitialState[] = []