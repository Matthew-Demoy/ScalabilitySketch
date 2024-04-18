export interface Message {
    edgeId : string,
    destinationNodeId : string,
    processKey : string,    
    callingThreadId : number,
    time : number,
    isResponse : boolean
}

export interface EdgeData {    
    latency : number
    //Each Edge has an id, sourceNodeId, and destinationNodeId at the reactflow level so it is not a part of data
}
