import { Handle, NodeProps, Position } from 'reactflow';
import { NodeData } from './types';

function Database({ id, data }: NodeProps<NodeData>) {

  return (
    <div className={'componentBorder'}>
      <Handle type="target" position={Position.Top} />
      Database
    </div>
  );
}

export default Database;
