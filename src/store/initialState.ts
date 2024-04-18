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
    ]
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
      {
        query: GetOrg,
        direction: Direction.RIGHT
      },
      {
        query: AddUser,
        direction: Direction.DOWN
      }
    ]
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
      {
        query: GetOrg,
        direction: Direction.DOWN
      }
    ]
  }

  
export const defaultProcesses = [ addUserClient, addUserProcess, getOrgProcess]

const thread : Thread = {
    threadID: 0,
    status: ThreadStatus.RUNNING,
    programCounter: 0,
    processId: 'p1',
}

export const defaultThreads = [thread]