import { Connection, Handle, NodeProps, Position } from 'reactflow';
import '../index.css'
import useStore from '../store/store';
import { ServerData } from './types';
import { NodeType } from '.';

function Server({ id, data }: NodeProps<ServerData>) {
  const nodes = useStore((state) => state.nodes);

  const handleIsValidConnection = (connection: Connection): boolean => {
    const match = nodes.find((node) => node.id === connection.target)

    return match?.type === NodeType.DATABASE
  }

  return (
    <div className='componentBorder'>
      <Handle type="target" position={Position.Top} />
      Server
      <Handle isValidConnection={handleIsValidConnection} type="source" position={Position.Bottom} />
    </div>);
}

export default Server;
