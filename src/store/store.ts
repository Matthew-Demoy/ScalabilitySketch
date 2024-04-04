import { create } from 'zustand';
import {
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
import { AddUser, ClientData, Component, NodeData, TaskLibrary, TaskStatus, TemplateLibrary, isClient, isEndNode, isPipeNode } from '../nodes/types';
import { Direction, EdgeData, Message } from '../edges/types';
import { TimeScale } from '../core/time';

interface UpdateCommon {
    outId: string;
    id: number;
    templateName: string;
}

interface UpdateNode extends UpdateCommon { }
interface UpdateEdge extends UpdateCommon {
    direction: Direction
}
type Update = UpdateNode | UpdateEdge;

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
    onConnect: OnConnect;
    setNodes: (nodes: Node[]) => void;
    setEdges: (edges: Edge[]) => void;
    updateSpawnRate: (nodeId: string, rate: number) => void;
    startSimulation: () => void;
    resetSimulation: () => void;
    tick: () => void;
    recievePacket: (update: Update) => void;
    incrementTaskCounter: () => void;
    time : number;
    timeScale : TimeScale;
    updateTimeScale: (scale : TimeScale) => void;
    taskLibrary : TaskLibrary;
    modifyTasks : (updatedLibrary : TaskLibrary) => void;
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
    taskCounter: 0,
    nodes: initialNodes,
    edges: initialEdges,
    isRunning: false,
    generators: [],
    time: 0,
    timeScale: TimeScale.MILLISECOND,
    taskLibrary : TemplateLibrary,
    modifyTasks : (updatedLibrary : TaskLibrary) => {
        set({
            taskLibrary : updatedLibrary
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
    onConnect: (connection: Connection) => {
        const edge : Edge<EdgeData> = {
            id: `${connection.source}-${connection.target}-${get().edges.length}`,
            source: connection.source ?? "",
            target: connection.target ?? "",      
            type: "transfer",
            data: { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND},
          }

        set({
            edges: addEdge(edge, get().edges),
        });
    },
    setNodes: (nodes: Node[]) => {
        set({ nodes });
    },
    setEdges: (edges: Edge[]) => {
        console.log("setting edges")
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
    recievePacket: (update: Update) => {
        const { outId: nodeId, templateName } = update
        if (!isUpdateEdge(update)) {
            set({
                nodes: get().nodes.map((node) => {
                    if (node.id === nodeId) {
                        let status = node.data.tasks.get(update.id)?.status || TaskStatus.PROCESS_IN
                        status = status == TaskStatus.WAITING ? TaskStatus.PROCESS_OUT : status
                        const newTasks = new Map(node.data.tasks);
                        newTasks.set(update.id, { id: update.id, t: 0, status, templateName });
                        node.data.tasks = newTasks;
                    }
                    return node;
                }),
            });
        } else {
            set({
                edges: get().edges.map((edge) => {
                    if (edge.id === nodeId && edge.data !== undefined) {
                        const newMessages = new Map(edge.data?.messages);
                        newMessages.set(update.id, { t: 0, id: update.id, direction: update.direction, templateName });
                        edge.data = { messages: newMessages, latency: edge.data.latency }
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
        const endNodes = nodes.filter(isEndNode)

        
        set({ time: time + timeScale });

        // If we have no generators, we don't need to do anything
        if (generators.length === 0) {
            return;
        }
        
        console.log(nodes, edges)
        let updates: Update[] = []
        // for each node see if it has packets, increment the time and send the packets
        pipes.forEach((node) => {
            if (node.data.tasks.size > 0) {
                //Go through each task and increment the time, if the time is greater than the latency, delete the task from the map
                node.data.tasks.forEach((task, taskId) => {
                    task.t += timeScale;
                    const latency = taskLibrary.get(task.templateName)?.get(Component.SERVER)?.time || 0

                    if (task.t >= latency && task.status !== TaskStatus.WAITING) {
                        edges.forEach((edge) => {
                            const matchingEdge = task.status === TaskStatus.PROCESS_IN ? edge.source : edge.target
                            if (matchingEdge === node.id) {
                                const direction = task.status === TaskStatus.PROCESS_IN ? Direction.TARGET : Direction.SOURCE
                                updates.push({ outId: edge.id, id: task.id, direction, templateName: task.templateName })
                            }
                        })
                        if (task.status === TaskStatus.PROCESS_IN) {
                            node.data.tasks.set(taskId, { id: taskId, t: 0, status: TaskStatus.WAITING, templateName: task.templateName })
                        } else {
                            node.data.tasks.delete(taskId)
                        }

                    }
                });
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
                        updates.push({ outId, id: messageId, templateName: message.templateName })
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
                            if (edge.target === node.id) {
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
            const dau = (generator.data as ClientData).spawnRate; // Assuming this is the DAU

            const secondsPerDay = 24 * 60 * 60
            const ticksPerDay = timeScale === TimeScale.MICROSECOND ? secondsPerDay * 1000000 : timeScale === TimeScale.MILLISECOND ? secondsPerDay * 1000 : secondsPerDay;
            const spawnRatePerTick = dau / ticksPerDay;
            edges.forEach((edge) => {
                if (edge.source === generator.id) {
                    // Spawn a task with probability spawnRatePerTick
                    if (Math.random() < spawnRatePerTick) {
                        console.log("spawning task")
                        updates.push({ outId: edge.id, id: taskCounter, direction: Direction.TARGET, templateName: AddUser })
                        incrementTaskCounter()
                    }
                }
            })
        });


        updates.forEach((update) => {
            get().recievePacket(update)
        })
    }



}));

export default useStore;
