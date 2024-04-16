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
import { AddUser, ClientData, Component, NodeData, ProcessData, ServerData, TaskLibrary, TaskStatus, TemplateLibrary, isClient, isEndNode, isPipeNode, isProcessNode } from '../nodes/types';
import { Direction, EdgeData, Message } from '../edges/types';
import { TimeScale } from '../core/time';
import createUpdateHelpers from './update';

interface UpdateCommon {
    outId: string;
    id: number;
    templateName: string;
}

export interface UpdateNode extends UpdateCommon {
    creatingId: string
}
export interface UpdateEdge extends UpdateCommon {
    direction: Direction
}
export type ComponentUpdate = UpdateNode | UpdateEdge;

//typeguard for is updateEdge
function isUpdateEdge(update: Update): update is UpdateEdge {
    return (update as UpdateEdge).direction !== undefined;
}

export type RFState = {
    taskCounter: number;
    nodes: Node<NodeData>[];
    edges: Edge<EdgeData>[];
    isRunning: boolean;
    generators: Node<NodeData>[];
    onNodesChange: OnNodesChange;
    onEdgesChange: OnEdgesChange;
    onConnect: (edgeParams: Edge | Connection) => void;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    updateSpawnRate: (nodeId: string, rate: number) => void;
    startSimulation: () => void;
    resetSimulation: () => void;
    tick: () => void;
    recievePacket: (update: UpdateNode) => void;
    incrementTaskCounter: () => void;
    time: number;
    timeScale: TimeScale;
    updateTimeScale: (scale: TimeScale) => void;
    taskLibrary: TaskLibrary;
    modifyTasks: (updatedLibrary: TaskLibrary) => void;
    modifyFeaturesForClient: (nodeId: string, features: { [string: string]: { callsPerDay: number } }) => void;
    nodeCounter: number;
};

export type StoreSet = (partial: RFState | Partial<RFState> | ((state: RFState) => RFState | Partial<RFState>), replace?: boolean | undefined) => void
export type StoreGet = () => RFState

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => {

    const {updateProcessNode, updateDatabaseNode} = createUpdateHelpers(set, get)
    return ({
        taskCounter: 0,
        nodes: initialNodes,
        edges: initialEdges,
        isRunning: false,
        generators: [],
        time: 0,
        timeScale: TimeScale.MILLISECOND,
        taskLibrary: TemplateLibrary,
        nodeCounter: 100,
        modifyTasks: (updatedLibrary: TaskLibrary) => {
            set({
                taskLibrary: updatedLibrary
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
        updateSpawnRate: (nodeId: string, spawnRate: number) => {
            set({
                nodes: get().nodes.map((node) => {
                    if (node.id === nodeId) {
                        node.data = { ...node.data, spawnRate };
                    }

                    return node;
                }),
            });
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
        recievePacket: (update: ComponentUpdate) => {
            const { outId: nodeId, templateName } = update
            if (!isUpdateEdge(update)) {
                const node = get().nodes.find((node => node.id == nodeId))
                
                if (!node) {
                    console.log("Node not found")
                } else if(isPipeNode(node)){
                    const process = get().nodes.find((node): node is Node<ProcessData> => isProcessNode(node) && node.parentNode == nodeId && node.data.key == templateName)
                    if (!process) {
                        console.log("Process not found")
                        return
                    }
                    updateProcessNode(process)   
                } else if(isEndNode(node)){
                    updateDatabaseNode(node, update)
                }else if(isClient(node)){
                    updateDatabaseNode(node, update)
                }
            } else {
                set({
                    edges: get().edges.map((edge) => {
                        if (edge.id === nodeId && edge.data !== undefined) {                            
                            const newMessages = new Map(edge.data?.messages);
                            newMessages.set(update.id, { t: 0, id: update.id, direction: update.direction, templateName });
                            edge.data = { messages: newMessages, latency: edge.data.latency, name: edge.data.name };
                            
                        }

                        return edge;
                    }),
                });
            }
        },
        startSimulation: () => {
            set({ isRunning: true });
        },
        resetSimulation: () => {
            set({ isRunning: false });
        },
        incrementTaskCounter: () => {
            set((state) => ({ taskCounter: state.taskCounter + 1 }));
        },
        updateTimeScale: (scale: TimeScale) => {
            set({ timeScale: scale });
        },
        tick: () => {
            const { nodes, edges, taskCounter, incrementTaskCounter, time, timeScale, taskLibrary } = get();
            const generators = nodes.filter(isClient);
            const pipes = nodes.filter(isPipeNode);
            const processNodes = nodes.filter(isProcessNode)
            const endNodes = nodes.filter(isEndNode)


            set({ time: time + timeScale });

            // If we have no generators, we don't need to do anything
            if (generators.length === 0) {
                return;
            }

            let updates: ComponentUpdate[] = []
            // for each node see if it has packets, increment the time and send the packets
            pipes.forEach((node) => {
                return
                if (node.data.tasks.size > 0) {
                    //Go through each task and increment the time, if the time is greater than the latency, delete the task from the map
                    node.data.tasks.forEach((task, taskId) => {
                        task.t += timeScale;
                        const latency = taskLibrary.get(task.templateName)?.get(Component.SERVER)?.time || 0

                        if (task.t >= latency && task.status !== TaskStatus.WAITING) {
                            //For each task we want to send the message either to its target edges or the edge that requested the task
                            edges.forEach((edge) => {
                                const matchingEdge = task.status === TaskStatus.PROCESS_IN ? edge.source == node.id : edge.id === task.callingEdge
                                if (matchingEdge) {
                                    const direction = task.status === TaskStatus.PROCESS_IN ? Direction.TARGET : Direction.SOURCE
                                    updates.push({ outId: edge.id, id: task.id, direction, templateName: task.templateName })
                                }
                            })
                            if (task.status === TaskStatus.PROCESS_IN) {
                                node.data.tasks.set(taskId, { id: taskId, t: 0, status: TaskStatus.WAITING, templateName: task.templateName, callingEdge: task.callingEdge })
                            } else {
                                node.data.tasks.delete(taskId)
                            }

                        }
                    });
                }
            })

            processNodes.forEach((processNode) => {
                if (processNode.data.processes.size > 0) {
                    const newProcesses = new Map(processNode.data.processes);
                    newProcesses.forEach((process, processId) => {
                        const callIndex = process.callIndex
                        if (callIndex < processNode.data.calls.length) {
                            console.log("new call", process)
                            const call = processNode.data.calls[callIndex]
                            if (process.status === TaskStatus.PROCESS_IN) {
                                // go from direction -> handle -> edge
                                let direction = processNode.data.calls[process.callIndex].direction
                                let outId = `${processNode.parentNode}-${direction}`
                                updates.push({ outId, id: processId, templateName: call.query, direction: Direction.TARGET })
                                process.callIndex += 1
                                process.status = TaskStatus.WAITING
                            }
                        } else if(callIndex == processNode.data.calls.length){
                            process.status = TaskStatus.PROCESS_OUT                                      
                            updates.push({ outId : process.callingEdge, id: processId, templateName: processNode.data.key, direction: Direction.SOURCE })
                        }
                    })

                    processNode.data.processes = newProcesses;

                    set({
                        nodes: get().nodes.map((node) => {
                            if (node.id == processNode.id) {
                                return processNode
                            }
                            return node
            
                        })
                    })
                }
            })

            edges.forEach((edge) => {
                if (edge.data && edge.data?.messages.size > 0) {
                    // Go through each message and increment the time, if the time is greater than the latency, delete the message from the array
                    edge.data.messages.forEach((message, messageId) => {
                        message.t += timeScale
                        const latency = taskLibrary.get(message.templateName)?.get(message.direction == Direction.TARGET ? Component.CLIENT_CALL : Component.SERVER_RESPONSE)?.time || 0
                        if (edge.data && message.t >= latency) {
                            edge.data.messages.delete(messageId)
                            const outId = message.direction == Direction.SOURCE ? edge.source : edge.target
                            updates.push({ outId, id: messageId, creatingId: edge.id, templateName: message.templateName })
                        }

                    })
                }
            })

            endNodes.forEach((node) => {
                if (node.data.tasks.size > 0) {
                    node.data.tasks.forEach((task, taskId) => {
                        task.t += timeScale;
                        const latency = taskLibrary.get(task.templateName)?.get(Component.DATABASE)?.time || 0
                        if (task.t >= latency) {

                            edges.forEach((edge) => {
                                if (edge.id === task.callingEdge) {
                                    updates.push({ outId: edge.id, id: task.id, direction: Direction.SOURCE, templateName: task.templateName })
                                }
                            })
                            const storage = taskLibrary.get(task.templateName)?.get(Component.DATABASE)?.storage || 0
                            node.data.total += storage
                            node.data.tasks.delete(taskId)
                        }
                    });
                }
            })

            // For each generator, we want to generate items
            generators.forEach((generator) => {
                Array.from(Object.keys(generator.data.features)).forEach((feature) => {
                    const dau = generator.data.features[feature].callsPerDay
                    const secondsPerDay = 24 * 60 * 60
                    const ticksPerDay = timeScale === TimeScale.MICROSECOND ? secondsPerDay * 1000000 : timeScale === TimeScale.MILLISECOND ? secondsPerDay * 1000 : secondsPerDay;
                    const spawnRatePerTick = dau / ticksPerDay;
                    edges.forEach((edge) => {
                        if (edge.source === generator.id && edge.sourceHandle === `${feature}-${generator.id}`) {
                            // Spawn a task with probability spawnRatePerTick
                            if (Math.random() < spawnRatePerTick) {
                                updates.push({ outId: edge.id, id: taskCounter, direction: Direction.TARGET, templateName: feature })
                                incrementTaskCounter()
                            }
                        }
                    })
                })
            });


            updates.forEach((update) => {
                get().recievePacket(update)
            })
        }

    })


});

export default useStore;
