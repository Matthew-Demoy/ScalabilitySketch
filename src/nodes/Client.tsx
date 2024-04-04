import React from 'react';
import { Connection, Edge, Handle, NodeProps, Position } from 'reactflow';

import useStore from '../store/store';
import { ClientData } from './types';
import { NodeType } from '.';
import { EdgeData, Message } from '../edges/types';
import { TimeScale } from '../core/time';

function FaucetNode({ id, data }: NodeProps<ClientData>) {
  const {nodes} = useStore((state) => {return {updateSpawnRate : state.updateSpawnRate, nodes : state.nodes}});

  const [infoOpen, setInfoOpen] = React.useState(false);
  
  const handleOpenClick = () => {
    setInfoOpen(!infoOpen);
  }

  const handleIsValidConnection = (connection : Connection) : boolean => {
    const match = nodes.find((node) => node.id === connection.target)
    
    return match?.type === NodeType.SERVER
  }

  const handleOnConnect = (connection : Connection) => {
    console.log("onConnect", connection)
    const Edge : Edge<EdgeData> = {
      id: `${id}-${connection.target}`,
      source: id,
      target: connection.target ?? "",      
      type: "transfer",
      data: { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND},
    }
    
    return Edge
  }

  return (
    <div className='componentBorder'>
        Client
      <Handle type={"source"}
      isValidConnection={handleIsValidConnection}
      onConnect={handleOnConnect}
      position={Position.Bottom} />
    </div>
  );
}

export default FaucetNode;
