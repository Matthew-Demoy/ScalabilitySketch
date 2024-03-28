import React from 'react';
import { Handle, NodeProps, Position } from 'reactflow';

import useStore, { NodeData } from '../store/store';

function EndNode({ id, data }: NodeProps<NodeData>) {

  return (
    <div>
      <Handle type="target" position={Position.Top} />
      <div style={{ padding: 20 }}>
        recieved {data.packets.length} packets
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default EndNode;
