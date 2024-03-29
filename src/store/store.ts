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
import { NodeData, SpawnNodeData, TaskStatus, isEndNode, isPipeNode, isSpawnNode } from '../nodes/types';
import { Direction, EdgeData } from '../edges/types';

interface Packet {
    t : number
    id: number
}


interface UpdateCommon {
    outId: string;
    id: number;
}

interface UpdateNode extends UpdateCommon {}
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
    updateMultiplier: (nodeId: string, rate: number) => void;
    startSimulation: () => void;
    resetSimulation: () => void;
    tick: () => void;
    recievePacket: (update : Update) => void;
    incrementTaskCounter: () => void;
    
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
    taskCounter: 0,
    nodes: initialNodes,
    edges: initialEdges,
    isRunning: false,
    generators: [],
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
        set({
            edges: addEdge(connection, get().edges),
        });
    },
    setNodes: (nodes: Node[]) => {
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
    updateMultiplier: (nodeId: string, rate: number) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    node.data = { ...node.data, rate };
                }

                return node;
            }),
        });
    },
    recievePacket: (update : Update) => {
        const { outId : nodeId } = update
        if(!isUpdateEdge(update)){
            set({
            nodes: get().nodes.map((node) => {                             
                if (node.id === nodeId) {
                    let status = node.data.tasks.get(update.id)?.status || TaskStatus.PROCESS_IN
                    status = status == TaskStatus.WAITING ? TaskStatus.PROCESS_OUT : status
                    const newTasks = new Map(node.data.tasks);
                    newTasks.set(update.id, {id: update.id, t: 0, status});
                    node.data.tasks = newTasks;
                }
                return node;
            }),
        });}else{
            console.log("update for edge", update)
            set({
                edges: get().edges.map((edge) => {
                    if (edge.id === nodeId && edge.data !== undefined) {
                        console.log("add new message", nodeId, edge.data)
                        const newMessages = new Map(edge.data?.messages);
                        newMessages.set(update.id,{t: 0, id: update.id, direction: update.direction});
                        edge.data = {messages : newMessages, latency: edge.data.latency}
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
    tick: () => {
        const { nodes, edges, taskCounter, incrementTaskCounter } = get();
        const generators = nodes.filter(isSpawnNode);
        const pipes = nodes.filter(isPipeNode);
        const endNodes = nodes.filter((node) => isEndNode(node));

        // If we have no generators, we don't need to do anything
        if (generators.length === 0) {
            return;
        }

        let updates : Update[] = []
        console.log(nodes, edges)
        // for each node see if it has packets, increment the time and send the packets
        pipes.forEach((node) => {
            if(node.data.tasks.size > 0){
                //Go through each task and increment the time, if the time is greater than the latency, delete the task from the map
                node.data.tasks.forEach((task, taskId) => {
                    task.t += 1;
                    if(task.t >= node.data.latency && task.status !== TaskStatus.WAITING){
                        console.log("task", task)                                 
                        edges.forEach((edge) => {
                            const matchingEdge = task.status === TaskStatus.PROCESS_IN ? edge.source : edge.target                            
                            if(matchingEdge === node.id){                                
                                console.log("pipe is updating", edge.id, task.id, task.status)
                                const direction = task.status === TaskStatus.PROCESS_IN ? Direction.TARGET : Direction.SOURCE
                                updates.push({outId : edge.id, id: task.id, direction})                                
                            }
                        })
                        if(task.status === TaskStatus.PROCESS_IN){
                            console.log("send out task", task)
                            node.data.tasks.set(taskId, {id: taskId, t: 0, status: TaskStatus.WAITING})
                        }else{
                            console.log("deleting task", task)
                            node.data.tasks.delete(taskId)
                        }
                        
                    }
                });
            }
        })

        edges.forEach((edge) => {
            if(edge.data && edge.data?.messages.size > 0){
                // Go through each message and increment the time, if the time is greater than the latency, delete the message from the array
                edge.data.messages.forEach((message, messageId) => {
                    message.t += 1
                    if(edge.data && message.t >= edge?.data.latency){
                        edge.data.messages.delete(messageId)
                        const outId = message.direction == Direction.SOURCE ? edge.source : edge.target
                        updates.push({outId, id: messageId})
                    }

                })                
            }
        })

        endNodes.forEach((node) => {
            if(node.data.tasks.size > 0){
                node.data.tasks.forEach((task, taskId) => {
                    task.t += 1;                    
                    if(task.t >= 1){                        
                        edges.forEach((edge) => {
                            if(edge.source === node.id){                                
                                updates.push({outId : edge.id, id: task.id, direction: Direction.SOURCE})                                
                            }
                        })                                  
                        node.data.tasks.delete(taskId)
                    }
                });
            }
        })

        // For each generator, we want to generate items
        generators.forEach((generator) => {
            const spawnRate = (generator.data as SpawnNodeData).spawnRate;
            
            edges.forEach((edge) => {
                if(edge.source === generator.id){
                    for( let i = 0 ; i < spawnRate; i++){
                        updates.push({outId : edge.id, id : taskCounter, direction: Direction.TARGET})                        
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
