import React, { useCallback, useEffect } from 'react';
import { Connection, Edge, Handle, NodeProps, Position, useUpdateNodeInternals } from 'reactflow';

import useStore from '../store/store';
import { ClientData } from './types';
import { NodeType } from '.';
import { EdgeData, Message } from '../edges/types';
import { TimeScale } from '../core/time';

const DEFAULT_HANDLE_STYLE = {
  width: 10,
  height: 10,
  bottom: -5,
};

function FaucetNode({ id, data }: NodeProps<ClientData>) {
  const {nodes, onConnect} = useStore((state) => {return {updateSpawnRate : state.updateSpawnRate, nodes : state.nodes, onConnect : state.onConnect}});
  
  const [infoOpen, setInfoOpen] = React.useState(false);
  
  const handleOpenClick = () => {
    setInfoOpen(!infoOpen);
  }

  const handleIsValidConnection = (connection : Connection) : boolean => {
    const match = nodes.find((node) => node.id === connection.target)
    
    return match?.type === NodeType.SERVER
  }

  const updateNodeInternals = useUpdateNodeInternals();
  
  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals]);

  
  const handleOnConnect = (connection : Connection, sourceHandleId : string) => {
    const Edge : Edge<EdgeData> = {
      id: `${id}-${connection.target}`,
      source: id,
      target: connection.target ?? "",      
      type: "transfer",
      sourceHandle: sourceHandleId,
      data: { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND},
    }
    
    console.log("connect", Edge)
    onConnect(Edge)
  }


  const margin = 20 * Object.keys(data.features).length;

  //create handles for each feature in data
  const handles = Array.from(Object.keys(data.features)).map(([feature, value], index) => {
    return (
      <Handle
        key={`${feature}-${id}`}
        type="source"
        position={Position.Bottom}
        id={`${feature}-${id}`}
        isValidConnection={handleIsValidConnection}
        onConnect={(connection) => handleOnConnect(connection, `${feature}-${id}`)}
        style={{ ...DEFAULT_HANDLE_STYLE, left: `${ margin * (index + 1)}%`, background: 'red' }}
      />
    );
  })

  return (
    <div className='componentBorder'>
        Client

      {handles}
    </div>
  );
}

export default FaucetNode;
