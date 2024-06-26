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
    applyNodeChanges,
    applyEdgeChanges,
} from 'reactflow';

import initialNodes from '../store/initialState/nodes';
import initialEdges from '../store/initialState/edges';
import { AddUser, Direction, NodeData, NodeType, Process, Thread, ThreadStatus } from '../nodes/types';
import { EdgeData, Message } from '../edges/types';
import { TimeScale } from '../core/time';
import { defaultProcesses, defaultThreads } from './initialState/initialState';
import { addUserClient, addUserClientWSpawn } from './initialState/process';


export type RFState = {
    //Counter to create globally unique thread ids
    globalCounter: number;
    presets : Preset[];
    loadPreset: (index : number) => void,
    latency : number;
    setLatency : (latency : number) => void;
    nodes: Node<NodeData>[];
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
    threads: Thread[],
    messages: Message[],
    processes: Process[],
    createMessage: (threadId: number, edgeId: string, callingNodeId: string, processKey: string, isResponse: boolean) => void
    createThread: (callingThreadId: number | null, destinationNodeId: string, processKey: string) => void
    updateThread: (threadId: number) => void
    updateProcess : (process: Process) => void
    createProcess: (parentId : string, key ?: string, displayName ?: string) => void
    resetState : () => void
    createNode : (type : NodeType) => void
};

export type StoreSet = (partial: RFState | Partial<RFState> | ((state: RFState) => RFState | Partial<RFState>), replace?: boolean | undefined) => void
export type StoreGet = () => RFState

export type InitialState = {
    processes: Process[],
    threads: Thread[],
    messages: Message[],
    nodes: Node<NodeData>[],
    edges: Edge<EdgeData>[],
}

type Preset = {
    name : string,
    state : InitialState
}

const initialState : InitialState = {
    processes: defaultProcesses,
    threads: defaultThreads,
    messages: [],
    nodes: initialNodes,
    edges: initialEdges,
}

const noProcessState : InitialState = {
    processes: [addUserClientWSpawn],
    threads: [],
    messages: [],
    nodes: initialNodes,
    edges: [],
}

const emptyState : InitialState = {
    processes: [],
    threads: [],
    messages: [],
    nodes: [],
    edges: [],
}

const presets : Preset[] = [
    {
        name : "Default",
        state : initialState
    },
    {
        name : "No Processes",
        state : noProcessState
    },
    {
        name : "Empty",
        state : emptyState
    }
]

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => {

    const getParentNodeForThread = (thread: Thread) => {
        const process = get().processes.find((process) => process.id == thread.processId)
        if (!process) {
            console.log("Process not found")
            return
        }
        const parentNode = get().nodes.find((node) => node.id == process.parentNode)
        if (!parentNode) {
            console.log("Parent Node not found")
            return
        }
        return parentNode
    }

    const getEdgeBetweenNodes = (nodeId1: string, nodeId2: string) => {
        const edge = get().edges.find((edge) => (edge.source == nodeId1 && edge.target == nodeId2) || edge.source == nodeId2 && edge.target == nodeId1)
        if (!edge) {
            console.log("Edge not found for" + nodeId1 + " and " + nodeId2)
            return
        }
        return edge
    }

    const getEdgeForDirection = (nodeId: string, direction: Direction) => {
        const edge = get().edges.find((edge) => edge.id.includes(`${nodeId}_${direction}`))
        if (!edge) {
            console.log("Edge not found for nodeId " + nodeId + " and direction " + direction)
            return
        }
        return edge
    }

    const getEdgeByThread = (thread: Thread) => {
        const process = get().processes.find((process) => process.id == thread.processId)
        if (!process) {
            console.log("Process not found")
            return
        }

        const parentNode = get().nodes.find((node) => node.id == process.parentNode)
        if (!parentNode) {
            console.log("Parent Node not found")
            return
        }

        const direction = process.subProcess[thread.programCounter].direction
        const edge = get().edges.find((edge) => edge.id == `${parentNode.id}-${direction}`)


        if (!edge) {
            console.log("Edge not found")
            return
        }
        return {
            process,
            parentNode,
            edge
        };
    }

    const getEdgeByCallingThreadId = (threadId: number) => {
        const thread = get().threads.find((thread) => thread.threadID == threadId)
        if (!thread) {
            console.log("Thread not found")
            return
        }
        return getEdgeByThread(thread)
    }

    return ({
        ...initialState,
        presets : presets,
        globalCounter: 123,
        isRunning: false,
        generators: [],
        time: 0,
        timeScale: TimeScale.MILLISECOND,
        latency : 0,
        loadPreset : (index : number) => {
            const preset = get().presets[index]
            set({
                ...preset.state
            })
        },
        createNode(type : NodeType) {
            const nodeCounter = get().globalCounter

            const displayName = type == NodeType.CLIENT ? "Client" : type == NodeType.SERVER ? "Server" : type == NodeType.DATABASE ? "Database" : "Server"
            const node: Node = {
                id: `s${nodeCounter}`,
                type: NodeType.SERVER,
                className: 'componentBorder server',
                position: { x: 0, y: 0 },
                data: {displayName},
            };
            set({
                nodes: [...get().nodes, node],
                globalCounter: nodeCounter + 1
            });
        },
        setLatency : (latency : number) => {
            set({
                latency
            })
        },
        resetState: () => {
            set({
                ...initialState
            })
        },
        updateProcess : (process: Process) => {
            set({
                processes: get().processes.map((curr) => {
                    if (curr.id == process.id) {
                        return process
                    }
                    return curr
                })
            })
        },
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
            console.log("Starting simulation")
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
        createProcess: (parentId : string, key : string = "", displayName = "") => {
            const counter = get().globalCounter
            const id = `${parentId}_p${counter}`
            const process: Process = {
                id: id,
                key,
                parentNode: parentId,
                displayName,
                memory: 0,
                storage: 0,
                time: 0,
                subProcess: [],
                spawnInfo : null
            }

            set({                
                processes: [...get().processes, process],
                globalCounter: counter + 1
            })
        },
        createMessage: (threadId: number, edgeId: string, callingNodeId: string, processKey: string, isResponse: boolean) => {
            const edge = get().edges.find((edge) => edge.id == edgeId)
            if (!edge) {
                console.log("Edge not found")
                return
            }
            const destinationNodeId = edge.source == callingNodeId ? edge.target : edge.source

            const message: Message = {
                edgeId,
                destinationNodeId,
                processKey,
                time: 0,
                callingThreadId: threadId,
                isResponse
            }
            set({
                messages: [...get().messages, message]
            })
        },
        
        /**
         * Calculates the sum of two numbers.
         *
         * @param callingThread - Specifies which thread on another process is spawning this one
         * @param destinationNodeId - The node id of the COMPONENT (parent of the process) that is spawning the thread
         * @param processKey - The key of the process that is being spawned (AddUser, GetUser, GetOrg, etc.)
         * @returns void
         */
        createThread: (callingThreadId: number | null, destinationNodeId: string, processKey: string) => {

            const process = get().processes.find(process => process.parentNode == destinationNodeId && process.key == processKey);

            if (!process) {
                console.log("Process not found", processKey, destinationNodeId, get().processes)
                return
            }

            const thread: Thread = {
                threadID: get().globalCounter,
                callingThreadId: callingThreadId,
                status: ThreadStatus.RUNNING,
                programCounter: 0,
                processId: process.id
            }
            set({
                threads: [...get().threads, thread]
            })
            get().incrementGlobalCounter()
        },
        updateThread: (threadId: number) => {
            const thread = get().threads.find((thread) => thread.threadID == threadId)
            if (!thread) {
                console.log("Thread not found")
                return
            }
            set({
                threads: get().threads.map((thread) => {
                    if (thread.threadID == threadId) {
                        thread.status = ThreadStatus.RUNNING
                        thread.programCounter++
                    }
                    return thread
                })
            })
        },
        tick: () => {
            const { threads, messages, processes, edges } = get()
            const { createMessage } = get()
            let updates = [];
            for (let i = 0; i < threads.length; i++) {
                const thread = threads[i]
                //skip if the thread is waiting
                if (thread.status == ThreadStatus.WAITING) {
                    continue
                }
                const process = processes.find((process) => process.id == thread.processId)
                if (!process) {
                    console.log("Process not found")
                    continue
                }
                if (thread.programCounter >= process.subProcess.length) {
                    if (thread.callingThreadId) {
                        const callingThread = threads.find((curr) => curr.threadID == thread.callingThreadId)
                        if (!callingThread) {
                            console.log("Calling thread not found")
                            continue
                        }
                        const node1 = getParentNodeForThread(thread)
                        if (!node1) {
                            console.log("Node1 not found")
                            continue
                        }
                        const node2 = getParentNodeForThread(callingThread)
                        if (!node2) {
                            console.log("Node2 not found")
                            continue
                        }
                        const edge = getEdgeBetweenNodes(node1.id, node2.id)
                        if (!edge) {
                            console.log("Edge not found")
                            continue
                        }
                        updates.push(() => createMessage(callingThread.threadID, edge.id, node1.id, process.key, true))
                    }
                    set({
                        threads: threads.filter((curr) => curr != thread)
                    })
                } else {
                    //execute the next sub process at the program counter
                    const subProcess = process.subProcess[thread.programCounter]
                    const parentNode = getParentNodeForThread(thread)
                    if (!parentNode) {
                        console.log("Parent Node not found")
                        continue
                    }
                    const edge = getEdgeForDirection(parentNode.id, subProcess.direction)
                    if (!edge) {
                        console.log("Edge not found")
                        continue
                    }
                    const callingProcessKey = process.subProcess[thread.programCounter].query                    
                    updates.push(() => createMessage(thread.threadID, edge.id, parentNode.id, callingProcessKey, false))
                    //set status to waiting
                    set({
                        threads: get().threads.map((curr) => {
                            if (curr.threadID == thread.threadID) {
                                return { ...curr, status: ThreadStatus.WAITING };
                            }
                            return curr;
                        })
                    })
                }
            }

            for (let i = 0; i < messages.length; i++) {
                const message = messages[i]
                const LATENCY = get().latency;
                const edge = edges.find((edge) => edge.id == message.edgeId)
                if (!edge) {
                    console.log("Edge not found")
                    continue
                }

                if (message.time >= LATENCY) {
                    //See if calling threadId is present in the destination node
                    if (message.isResponse) {
                        updates.push(() => get().updateThread(message.callingThreadId))
                    } else {                        
                        updates.push(() => get().createThread(message.callingThreadId, message.destinationNodeId, message.processKey))
                    }
                    //remove message
                    set({
                        messages: get().messages.filter((curr) => curr != message)
                    })
                } else {
                    set({
                        messages: get().messages.map((curr) => {
                            if (curr === message) {
                                return { ...curr, time: curr.time + 1 };
                            }
                            return curr;
                        })
                    })
                }
            }

            for (let i = 0; i < updates.length; i++) {
                updates[i]()
            }
        
            processes.forEach((process) => {
                if(process.spawnInfo) {
                    const spawnInfo = process.spawnInfo     
                    if(get().time % spawnInfo.msBetweenSpawns == 0 && spawnInfo.totalSpawns < spawnInfo.maxSpawns) {    
                            const parentNode = get().nodes.find((node) => node.id == process.parentNode)
                            if (!parentNode) {
                                console.log("Parent Node not found")
                                return
                            }
                            get().createThread(null, parentNode.id, process.key)                                   
                            spawnInfo.totalSpawns++                
                    }
                }
            })
            set({
                time: get().time + 1
            })
        }    
    })
});

export default useStore;
