import { Handle, NodeProps, Position } from 'reactflow';
import '../index.css'
import useStore from '../store/store';
import { ServerData } from './types';

function Server({ id, data }: NodeProps<ServerData>) {
  

  const updateMultiplier = useStore((state) => state.updateMultiplier);

  return (
    <div className='componentBorder'>
      <Handle type="target" position={Position.Top} />
        Server
      <Handle type="source" position={Position.Bottom} />
    </div>  );
}

export default Server;
