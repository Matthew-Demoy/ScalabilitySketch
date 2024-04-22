
import { AddUser, Direction, GetOrg, Process } from "../../nodes/types"


const addUserClientSpawnInfo = {
  msBetweenSpawns: 1,
  maxSpawns: 3,
  totalSpawns: 0
}


const callAddUser =     {
    query: AddUser,
    direction: Direction.DOWN
  }

export const addUserClient: Process = {
  nodeId: 'p1',
  id: 'p1',
  displayName: 'Add User',
  key: AddUser,
  memory: 100,
  time: 5,
  storage: 0,
  subProcess: [

  ],
  spawnInfo: null
}

export const addUserClientWCalls : Process = {
  ...addUserClient,
  subProcess : [callAddUser]
}

export const addUserClientWSpawn : Process = {
  ...addUserClientWCalls,
  spawnInfo: addUserClientSpawnInfo
}

const getOrg =   {
    query: GetOrg,
    direction: Direction.RIGHT
  }
const addUserDb = [
    {
        query: GetOrg,
        direction: Direction.RIGHT
      },
  {
    query: AddUser,
    direction: Direction.DOWN
  }
]

export const addUserProcess: Process = {
  nodeId: 'p2',
  displayName: 'Add User',
  id: 'p2',
  key: AddUser,
  memory: 100,
  storage: 0,
  time: 5,
  subProcess: [],
  spawnInfo: null
}

export const addUserProcessWCalls : Process = {
  ...addUserProcess,
  subProcess : addUserDb
}

const getOrgProcess: Process = {
  nodeId: 'p3',
  id: 'p3',
  displayName: 'Get Org',
  key: GetOrg,
  memory: 100,
  time: 5,
  storage: 0,
  subProcess: [],
  spawnInfo: null
}

const addUserDatabase: Process = {
  nodeId: 'p4',
  id: 'p4',
  displayName: 'Persist User',
  key: AddUser,
  memory: 100,
  time: 5,
  storage: 500,
  subProcess: [
  ],
  spawnInfo: null
}



export const defaultProcesses = [addUserClient, addUserProcess, getOrgProcess, addUserDatabase]


export const isolatedP1 = [
    {
        process: addUserClient,
        spawnInfo: addUserClientSpawnInfo
    }
]

export const twoNodes = [
    {
        process: {...addUserClient, subProcess: [callAddUser]},
    },
    {
        process: addUserProcess,
        spawnInfo: null
    }
]


export const threeNodes = [
    {
        process: {...addUserClient, subProcess: [callAddUser]},
    },
    {
        process: {...addUserProcess, subProcess: [getOrg]},
        spawnInfo: null
    },
    {
        process: getOrgProcess,
        spawnInfo: null
    }
]

export const fourNodes = [
    {
        process: {...addUserClient, subProcess: [callAddUser]},
        spawnInfo: addUserClientSpawnInfo
    },
    {
        process: {...addUserProcess, subProcess: addUserDb},
        spawnInfo: null
    },
    {
        process: getOrgProcess,
        spawnInfo: null
    },
    {
        process: addUserDatabase,
        spawnInfo: null
    }
]