import {  Thread, ThreadStatus } from "../../nodes/types"
export const p1Thread: Thread = {
  threadID: 1,
  status: ThreadStatus.RUNNING,
  programCounter: 0,
  processId: 'p1',
  callingThreadId: null,
}


export const defaultThreads = []