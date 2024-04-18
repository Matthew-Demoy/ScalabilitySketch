import { create } from 'zustand';
import ReactFlow, {
    Connection,
    Edge,
    EdgeChange,
    Node,
    NodeChange,
    addEdge,
    OnNodesChange,
    OnEdgesChange,
    OnConnect,
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';

import initialNodes from '../nodes/index';
import initialEdges from '../edges/index';
import { AddUser, Direction, Process, Thread, ThreadStatus } from '../nodes/types';
import { EdgeData, Message } from '../edges/types';
import { TimeScale } from '../core/time';
import { defaultProcesses, defaultThreads } from './initialState';


export type RFState = {
    //Counter to create globally unique thread ids
    globalCounter: number;
    nodes: Node<undefined>[];
    edges: Edge<EdgeData>[];
    isRunning: boolean;
    generators: Node<undefined>[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (edgeParams: Edge | Connection) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    startSimulation: () => void;
    resetSimulation: () => void;
    tick: () => void;
    incrementGlobalCounter: () => void;
    time: number;
    timeScale: TimeScale;
    updateTimeScale: (scale: TimeScale) => void;
    threads : Thread[],
    messages : Message[],
    processes : Process[],
    createMessage : (threadId : number, edgeId : string, callingNodeId : string, processKey : string, isResponse : boolean) => void
    createThread : (callingThreadId : number, destinationNodeId : string, processKey : string)  => void
    updateThread : (threadId : number) => void
};

export type StoreSet = (partial: RFState | Partial<RFState> | ((state: RFState) => RFState | Partial<RFState>), replace?: boolean | undefined) => void
export type StoreGet = () => RFState

console.log("zustand create", create)
// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => {

    
    const getParentNodeForThread = (thread : Thread) => {
        const process = get().processes.find((process) => process.id == thread.processId)
        if(!process){
            console.log("Process not found")
            return
        }
        
        const processNode = get().nodes.find((node) => node.id == process.nodeId)
        if(!processNode){
            console.log("Process Node not found")
            return
        }
        const parentNode = get().nodes.find((node) => node.id == processNode.parentNode)
        if(!parentNode){
            console.log("Parent Node not found")
            return
        }
        return parentNode
    }

    const getEdgeBetweenNodes = (nodeId1 : string, nodeId2 : string) => {
        const edge = get().edges.find((edge) => (edge.source == nodeId1 && edge.target == nodeId2) ||  edge.source == nodeId2 && edge.target == nodeId1)
        if(!edge){
            console.log("Edge not found for" + nodeId1 + " and " + nodeId2)
            return
        }
        return edge
    }

    const getEdgeForDirection = (nodeId : string, direction : Direction) => {
        const edge = get().edges.find((edge) => edge.id.includes(`${nodeId}_${direction}`))
        if(!edge){
            console.log("Edge not found for nodeId " + nodeId + " and direction " + direction)
            return
        }
        return edge
    }



    const getEdgeByThread = (thread : Thread ) => {
        const process = get().processes.find((process) => process.id == thread.processId)
        if(!process){
            console.log("Process not found")
            return
        }
        
        const node = get().nodes.find((node) => node.id == process.nodeId)
        if(!node){
            console.log("Node not found")
            return
        }
        const parentNode = get().nodes.find((node) => node.id == node.data.parentNode)
        if(!parentNode){
            console.log("Parent Node not found")
            return
        }
        
        const direction = process.subProcess[thread.programCounter].direction
        const edge = get().edges.find((edge) => edge.id == `${parentNode.id}-${direction}`)

        
        if(!edge){
            console.log("Edge not found")
            return
        }
        return {
            process,
            parentNode,
            edge
        };
    }

    const getEdgeByCallingThreadId = (threadId : number) => {
        const thread = get().threads.find((thread) => thread.threadID == threadId)
        if(!thread){
            console.log("Thread not found")
            return
        }
        return getEdgeByThread(thread)
    }

    return ({
        globalCounter: 0,
        nodes: initialNodes,
        edges: initialEdges,
        isRunning: false,
        generators: [],
        time: 0,
        timeScale : TimeScale.MILLISECOND,
        onNodesChange: (changes: NodeChange[]) => {
            set({
                nodes: applyNodeChanges(changes, get().nodes),
            });
        },
        onEdgesChange: (changes: EdgeChange[]) => {
            set({
                edges: applyEdgeChanges(changes, get().edges),
            });
        },
        onConnect: (connection: Connection | Edge) => {
            if (!('id' in connection)) {
                const edge: Edge<EdgeData> = {
                    id: `${connection.source}-${connection.target}-${get().edges.length}`,
                    source: connection.source ?? "",
                    target: connection.target ?? "",
                    type: "transfer",
                    data: { messages: new Map<number, Message>(), latency: 2 * TimeScale.MILLISECOND, name: "" },
                }
                set({
                    edges: addEdge(edge, get().edges),
                });
            } else {
                set({
                    edges: addEdge(connection, get().edges),
                });
            }
        },
        setNodes: (nodes: Node[]) => {
            const nodeCounter = get().nodeCounter
            const additionalIndex = nodes.length - get().nodes.length
            if (additionalIndex > 0) {
                set({ nodeCounter: nodeCounter + additionalIndex })
            }
            set({ nodes });
        },
        setEdges: (edges: Edge[]) => {
            set({ edges });
        },
        modifyFeaturesForClient: (nodeId: string, features: { [string: string]: { callsPerDay: number } }) => {
            set({
                nodes: get().nodes.map((node) => {
                    if (node.id === nodeId) {
                        (node.data as ClientData).features = features
                    }

                    return node;
                }),
            });
        },
        startSimulation: () => {
            set({ isRunning: true });
        },
        resetSimulation: () => {
            set({ isRunning: false });
        },
        incrementGlobalCounter: () => {
            set((state) => ({ globalCounter: state.globalCounter + 1 }));
        },
        updateTimeScale: (scale: TimeScale) => {
            set({ timeScale: scale });
        },
        threads : defaultThreads,
        messages : [],
        processes : defaultProcesses,
        createMessage : (threadId : number, edgeId : string, callingNodeId : string, processKey : string, isResponse : boolean) => {
            const edge = get().edges.find((edge) => edge.id == edgeId)
            if(!edge){
                console.log("Edge not found")
                return
            }
            const destinationNodeId = edge.source == callingNodeId ? edge.target : edge.source

            const message : Message = {
                edgeId,
                destinationNodeId,
                processKey,
                time : 0,
                callingThreadId : threadId,
                isResponse
            }
            set({
                messages: [...get().messages, message]
            })
        },
        createThread : (callingThreadId : number, destinationNodeId : string, processKey : string) => {
            
            const processNodeIds = new Set(get().nodes.filter(node => node.parentNode == destinationNodeId).map(node => node.id));
            const process = get().processes.find(process => processNodeIds.has(process.nodeId) && process.key == processKey);

            if(!process){
                console.log("Process not found", processKey, destinationNodeId, get().processes)
                return
            }
            const thread : Thread = {
                threadID: get().globalCounter,
                callingThreadId: callingThreadId,
                status : ThreadStatus.RUNNING,
                programCounter : 0,
                processId : process.id
            }
            set({
                threads: [...get().threads, thread]
            })
            get().incrementGlobalCounter()
        },
        updateThread : (threadId : number) => {
            const thread = get().threads.find((thread) => thread.threadID == threadId)
            if(!thread){
                console.log("Thread not found")
                return
            }
            set({
                threads: get().threads.map((thread) => {
                    if(thread.threadID == threadId){
                        thread.status = TaskStatus.RUNNING
                        thread.programCounter++
                    }
                    return thread
                })
            })
        },
        tick: () => {
            const { threads, messages, processes, nodes, edges } = get()
            const {createMessage} = get()
            let updates = [];
            for(let i = 0; i < threads.length; i++){
                const thread = threads[i]
                //skip if the thread is waiting
                if(thread.status == ThreadStatus.WAITING){
                    continue
                }
                const process = processes.find((process) => process.id == thread.processId)
                if(!process){
                    console.log("Process not found")
                    continue
                }
                //respond to the calling thread if current thread is complete
                if(thread.programCounter >= process.subProcess.length){                    
                    if(thread.callingThreadId){
                        const callingThread = threads.find((thread) => thread.threadID == thread.callingThreadId)
                        if(!callingThread){
                            console.log("Calling thread not found")
                            continue
                        }
                        const node1 = getParentNodeForThread(thread)    
                        if(!node1){
                            console.log("Node1 not found")
                            continue
                        }
                        const node2 = getParentNodeForThread(callingThread)
                        if(!node2){
                            console.log("Node2 not found")
                            continue
                        }
                        const edge = getEdgeBetweenNodes(node1.id, node2.id)
                        if(!edge){
                            console.log("Edge not found")
                            continue
                        }
                        updates.push(() => createMessage(callingThread.threadID ,edge.id, node1.id, process.key, true))
                    }                                    
                    //remove the thread since it is done
                    set({
                        threads: threads.filter((thread) => thread.threadID != thread.threadID)
                    })
                }else {
                    //execute the next sub process at the program counter
                    const subProcess = process.subProcess[thread.programCounter]
                    const parentNode = getParentNodeForThread(thread)
                    if(!parentNode){
                        console.log("Parent Node not found")
                        continue
                    }
                    const edge = getEdgeForDirection(parentNode.id, subProcess.direction)
                    if(!edge){
                        console.log("Edge not found")
                        continue
                    }
                    updates.push(() => createMessage(thread.threadID, edge.id, parentNode.id, process.key, false))
                    //set status to waiting
                    set({
                        threads: threads.map((curr) => {
                            if(curr.threadID == thread.threadID){
                                return {...curr, status: ThreadStatus.WAITING};
                            }
                            return curr;
                        })
                    })
                }
            }

            for(let i = 0; i < messages.length; i++){
                const message = messages[i]
                const LATENCY = 2;
                const edge = edges.find((edge) => edge.id == message.edgeId)
                if(!edge){
                    console.log("Edge not found")
                    continue
                }

                if(message.time >= LATENCY){
                    //See if calling threadId is present in the destination node
                    if(message.isResponse){
                        updates.push(() => get().updateThread(message.callingThreadId))
                    }else{
                        updates.push(() => get().createThread(message.callingThreadId, message.destinationNodeId, message.processKey))
                    }
                    //remove message
                    set({
                        messages: messages.filter((curr) => curr != message)
                    })
                }else{
                    set({
                        messages: messages.map((curr) => {
                            if(curr === message){
                                return {...curr, time: curr.time + 1};
                            }
                            return curr;
                        })
                    })
                }                                
            }
            
            console.log(updates)
            for(let i = 0; i < updates.length; i++){
                updates[i]()
            }
        }})
});

console.log("useStore here", useStore)
export default useStore;
