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
import { NodeData, SpawnNodeData, TaskStatus, isPipeNode, isSpawnNode } from '../nodes/types';
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
    updateRecived: (nodeId: string, recieved: number) => void;
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
    updateRecived: (nodeId: string, recieved: number) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    node.data = { ...node.data, total: recieved + node.data.total };
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
                    node.data.tasks.set(update.id, {id: update.id, t: 0, status: TaskStatus.PROCESS_IN})                    
                }

                return node;
            }),
        });}else{
            set({
                edges: get().edges.map((edge) => {
                    if (edge.id === nodeId) {
                        edge.data?.messages.set(update.id,{t: 0, id: update.id, direction: update.direction})                        
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

        // If we have no generators, we don't need to do anything
        if (generators.length === 0) {
            return;
        }

        let updates : Update[] = []

        // for each node see if it has packets, increment the time and send the packets
        pipes.forEach((node) => {
            if(node.data.tasks.size > 0){
                //Go through each task and increment the time, if the time is greater than the latency, delete the task from the map
                node.data.tasks.forEach((task, taskId) => {
                    task.t += 1;
                    if(task.t >= node.data.latency && task.status === TaskStatus.PROCESS_IN){                        
                        edges.forEach((edge) => {
                            if(edge.source === node.id){                                
                                updates.push({outId : edge.id, id: task.id})                                
                            }
                        })                     
                        node.data.tasks.set(taskId, {id: taskId, t: 0, status: TaskStatus.WAITING})
                    }
                });
            }
        })

        edges.forEach((edge) => {
            if(edge.data && edge.data?.messages.length > 0){
                // Go through each message and increment the time, if the time is greater than the latency, delete the message from the array
                for(let i = 0; i < edge.data.messages.length; i++){
                    edge.data.messages[i].t += 1
                    if(edge.data.messages[i].t >= edge.data.latency){
                        edge.data.messages.splice(i, 1)
                        updates.push({outId : edge.target,  direction: Direction.DESTINATION,  id: i})
                    }
                }
            }
        })

        // For each generator, we want to generate items
        generators.forEach((generator) => {
            const spawnRate = (generator.data as SpawnNodeData).spawnRate;
            
            edges.forEach((edge) => {
                if(edge.source === generator.id){
                    for( let i = 0 ; i < spawnRate; i++){
                        updates.push({outId : edge.id, id : taskCounter, isNode : false})                        
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
