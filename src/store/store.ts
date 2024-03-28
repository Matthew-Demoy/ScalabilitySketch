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

interface Packet {
    t : number
}
interface Common {
    packets : Packet[]
}
interface SpawnNodeData extends Common {
    spawnRate: number
}

type SpawnNode = Node<SpawnNodeData>;

const isSpawnNode = (node: Node<NodeData>): node is SpawnNode => {
    return node.type === 'faucet';
};

interface PipeData extends Common{
    rate: number
    latency: number
}
type PipeNode = Node<PipeData>;

const isPipeNode = (node: Node<NodeData>): node is PipeNode => {
    return node.type === 'pipe';
};

interface EndNodeData extends Common {
    total: number
}


export interface EdgeData extends Common { 
    latency : number
}

interface Update {
    outId: string;
    data: Packet
    isNode : boolean
}

export type NodeData = SpawnNodeData | PipeData | EndNodeData

export type RFState = {
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
    recievePacket: (nodeId: string, packet: Packet, isNode : boolean) => void;
    
};

// this is our useStore hook that we can use in our components to get parts of the store and call actions
const useStore = create<RFState>((set, get) => ({
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
    recievePacket: (nodeId: string, packet: Packet, isNode : boolean) => {
        if(isNode){
            set({
            nodes: get().nodes.map((node) => {
                if (node.id === nodeId) {
                    node.data = { ...node.data, packets: [packet, ...node.data.packets] };
                }

                return node;
            }),
        });}else{
            set({
                edges: get().edges.map((edge) => {
                    if (edge.id === nodeId) {
                        edge.data = { ...edge.data, packets: [...edge.data.packets, packet] };
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
    tick: () => {
        const { nodes, edges } = get();
        const generators = nodes.filter(isSpawnNode);
        const pipes = nodes.filter(isPipeNode);        

        // If we have no generators, we don't need to do anything
        if (generators.length === 0) {
            return;
        }

        let updates : Update[] = []

        // for each node see if it has packets, increment the time and send the packets
        pipes.forEach((node) => {
            if(node.data.packets.length > 0){
                //Go through each packet and increment the time, if the time is greater than the latency, delete the packet form the array
                for(let i = 0; i < node.data.packets.length; i++){
                    node.data.packets[i].t += 1
                    if(node.data.packets[i].t >= node.data.latency){                        
                        edges.forEach((edge) => {
                            if(edge.source === node.id){                                
                                updates.push({outId : edge.id, data : {t : 0}, isNode : false})                                
                            }
                        })
                        node.data.packets.splice(i, 1)                        
                    }
                }
            }
        })

        edges.forEach((edge) => {
            if(edge.data && edge.data?.packets.length > 0){
                //Go through each packet and increment the time, if the time is greater than the latency, delete the packet form the array
                for(let i = 0; i < edge.data.packets.length; i++){
                    edge.data.packets[i].t += 1
                    if(edge.data.packets[i].t >= edge.data.latency){
                        edge.data.packets.splice(i, 1)
                        updates.push({outId : edge.target, data : {t : 0}, isNode : true})
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
                        updates.push({outId : edge.id, data : {t : 0}, isNode : false})
                    }                    
                }
            })
        });

        
        updates.forEach((update) => {
            get().recievePacket(update.outId, update.data, update.isNode)
        })
    }

 

}));

export default useStore;
