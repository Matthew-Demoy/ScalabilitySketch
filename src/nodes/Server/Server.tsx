import { Connection, Handle, NodeProps, Position, Edge, NodeResizer } from 'reactflow';
import '../../index.css'
import useStore from '../../store/store';
import { ServerData } from '../types';
import { NodeType } from '..';
import { EdgeData, Message } from '../../edges/types';
import { TimeScale } from '../../core/time';
import "./Server.css"
import { memo } from 'react';

function Server({ id, data, selected }: NodeProps<ServerData>) {
  const nodes = useStore((state) => state.nodes);
  const onConnect = useStore((state) => state.onConnect);

  const handleIsValidConnection = (connection: Connection): boolean => {
    const match = nodes.find((node) => node.id === connection.target)

    return match?.type === NodeType.DATABASE
  }
  const handleOnConnect = (connection : Connection) => {
    const Edge : Edge<EdgeData> = {
      id: `${id}-${connection.target}`,
      source: id,
      target: connection.target ?? "",      
      type: "transfer",
      data: { messages: new Map<number, Message>(), latency : 2 * TimeScale.MILLISECOND},
    }
    
    onConnect(Edge)
  }
  
  return (
    <>
      <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
      <Handle type="target" position={Position.Top} />
      Server
      <Handle isValidConnection={handleIsValidConnection}  onConnect={(connection) => handleOnConnect(connection)}  type="source" position={Position.Bottom} />
    </>);
}

export default memo(Server);
