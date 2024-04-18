import { Edge } from 'reactflow';

//const edge1_2Data : EdgeData = { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND}
//const edge2_3Data : EdgeData = { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND}
//const edge3Data : EdgeData = { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND}
//const edge4Data : EdgeData = { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND}

//edge1_2Data.messages.set(130, {t: 0, id: 1000, direction: Direction.TARGET, templateName : "addUser"})
//edge2_3Data.messages.set(131, {t: 1, id: 1000, direction: Direction.SOURCE})
//edge2_3Data.messages.set(132, {t: 2, id: 1000, direction: Direction.SOURCE})

//edge2_3Data.messages.set(11, {t: 0, id: 1000, direction: Direction.TARGET})
//edge2_3Data.messages.set(12, {t: 1, id: 1000, direction: Direction.TARGET})
//edge2_3Data.messages.set(13, {t: 1, id: 1000, direction: Direction.TARGET})

export default [
  //{ id: 'addUser-1',sourceHandle:'addUser-1', source: '1', target: '2', type: "transfer", data: edge1_2Data},
  { id: 's1_down_s2_up', source: 's1', target: 's2', type: "transfer"},
  { id: 's2_right_s3_left', source: 's2', target: 's3', type: "transfer", sourceHandle: '3', targetHandle: '2'},
  //{ id: '2-right', source: '2', target: '5', type: "transfer", data: edge3Data, sourceHandle: '3', targetHandle: '2'},
  //{ id: 'e1-5', source: '5', target: '6', type: "transfer", data: edge1_2Data, sourceHandle: '1', targetHandle: '4'},
  //{ id: '5-down', source: '5', target: '6', type: "transfer", data: edge4Data},
] as  Edge[];
