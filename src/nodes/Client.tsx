import React, { useCallback, useEffect } from 'react';
import { Connection, Edge, Handle, NodeProps, Position, useUpdateNodeInternals } from 'reactflow';

import useStore from '../store/store';
import { ClientData, ProcessData } from './types';
import { NodeType } from '.';
import { EdgeData, Message } from '../edges/types';
import { TimeScale } from '../core/time';
import {
  Node,
} from 'reactflow';

const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  bottom: -5,
};

function FaucetNode({ id, data }: NodeProps<ClientData>) {
  const { nodes, onConnect, setNodes, nodeCounter } = useStore((state) => 
  { return { updateSpawnRate: state.updateSpawnRate, 
    nodes: state.nodes, 
    onConnect: state.onConnect, 
    setNodes: state.setNodes,
    nodeCounter : state.nodeCounter
  } });

  const [infoOpen, setInfoOpen] = React.useState(false);

  const handleOpenClick = () => {
    setInfoOpen(!infoOpen);
  }

  const handleIsValidConnection = (connection: Connection): boolean => {
    const match = nodes.find((node) => node.id === connection.target)
    return match?.type === NodeType.SERVER
  }

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);


  const handleOnConnect = (connection: Connection, sourceHandleId: string, featureName : string) => {
    const Edge: Edge<EdgeData> = {
      id: `${id}-${connection.target}-${featureName}`,
      source: id,
      target: connection.target ?? "",
      type: "transfer",
      sourceHandle: sourceHandleId,
      data: { messages: new Map<number, Message>(), latency: 2 * TimeScale.MILLISECOND, name: featureName},
    }

    //This should be checked also by handleIsValidConnection
    if (connection.target === undefined) {
      return
    }

    const processNodeData : ProcessData = {
      name: featureName,
      memory: 100,
      time: 100,
      callIndex : 0,
      calls: []
    }

    const newProcess: Node<ProcessData> = {
      id: nodeCounter.toString(),
      type: NodeType.PROCESS,
      data: processNodeData,
      position: { x: 20, y: 60 },
      parentNode: connection.target ?? "0",
      extent: 'parent',
    }

    onConnect(Edge)
    setNodes([...nodes, newProcess])

  }


  const margin = 20 * Object.keys(data.features).length;

  //create handles for each feature in data
  const handles = Object.keys(data.features).map((feature, index) => {
    return (
      <Handle
        key={`${feature}-${id}`}
        type="source"
        position={Position.Bottom}
        id={`${feature}-${id}`}
        isValidConnection={handleIsValidConnection}
        onConnect={(connection) => handleOnConnect(connection, `${feature}-${id}`, feature)}
        style={{ ...DEFAULT_HANDLE_STYLE, left: `${margin * (index + 1)}%`, background: 'red' }}
      />
    );
  });

  return (
    <div className='componentBorder'>
      Client

      {handles}
    </div>
  );
}

export default FaucetNode;
