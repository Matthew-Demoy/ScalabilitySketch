import { Handle, NodeProps, Position } from 'reactflow';
import { NodeData } from './types';

function EndNode({ id, data }: NodeProps<NodeData>) {

  return (
    <div>
      <Handle type="target" position={Position.Top} />
      <div style={{ padding: 20 }}>
        recieved {data.tasks.size} packets
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default EndNode;
