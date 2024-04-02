import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

import useStore from '../store/store';
import { ClientData } from './types';

function FaucetNode({ id, data }: NodeProps<ClientData>) {
  

  const updateSpawnRate = useStore((state) => state.updateSpawnRate);

  const [infoOpen, setInfoOpen] = React.useState(false);
  
  const handleOpenClick = () => {
    setInfoOpen(!infoOpen);
  }

  return (
    <div className='componentBorder'>
        Client
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default FaucetNode;
