import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

import useStore, { NodeData } from '../store/store';

function FaucetNode({ id, data }: NodeProps<NodeData>) {
  

  const updateSpawnRate = useStore((state) => state.updateSpawnRate);

  return (
    <div>
      <Handle type="target" position={Position.Top} />
      <div style={{ padding: 20 }}>
        <input
          type="text"
          defaultValue={data.spawnRate}
          onChange={(evt) => updateSpawnRate(id, evt.target.value)}
          className="nodrag"
        />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default FaucetNode;
