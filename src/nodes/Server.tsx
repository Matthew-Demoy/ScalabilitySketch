import { Handle, NodeProps, Position } from 'reactflow';

import useStore from '../store/store';
import { PipeData } from './types';

function PipeNode({ id, data }: NodeProps<PipeData>) {
  

  const updateMultiplier = useStore((state) => state.updateMultiplier);

  return (
    <div>
      <Handle type="target" position={Position.Top} />
      <div style={{ padding: 20 }}>
        <input
          type="text"
          defaultValue={data.rate}
          onChange={(evt) => updateMultiplier(id, parseInt(evt.target.value))}
          className="nodrag"
        />
      </div>
      <Handle type="source" position={Position.Bottom} />
    </div>
  );
}

export default PipeNode;