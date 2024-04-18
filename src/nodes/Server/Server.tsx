import { Connection, Handle, NodeProps, Position, Edge, NodeResizer, useUpdateNodeInternals } from 'reactflow';
import '../../index.css'
import useStore from '../../store/store';
import { Direction } from '../types';
import { NodeType } from '..';
import { EdgeData, Message } from '../../edges/types';
import { TimeScale } from '../../core/time';
import "./Server.css"
import { memo, useEffect } from 'react';
import { Node } from 'reactflow';

function Server({ id, data, selected }: NodeProps<undefined>) {
  const nodes = useStore((state) => state.nodes);
  const onConnect = useStore((state) => state.onConnect);
  const process = useStore(state => state.processes. find(process => process.nodeId === id))
  

  const handleIsValidConnection = (connection: Connection): boolean => {
    const match = nodes.find((node) => node.id === connection.target)
    if (!match) return false
    console.log(connection)
    return isEndNode(match) || isPipeNode(match)
  }

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
  updateNodeInternals(id);
  }, [id, updateNodeInternals]);


  const handleOnConnect = (connection: Connection, direction : Direction) => {
    const Edge: Edge<EdgeData> = {
      id: `${id}-${direction}`,
      source: id,
      sourceHandle: connection.sourceHandle ?? "",
      targetHandle: connection.targetHandle ?? "",
      target: connection.target ?? "",
      type: "transfer",
      data: { messages: new Map<number, Message>(), latency: 2 * TimeScale.MILLISECOND },
    }

    onConnect(Edge)
  }

  return (
    <>
      <NodeResizer color="#ff0071" isVisible={selected} minWidth={100} minHeight={30} />
      <Handle id={'4'}type="target" position={Position.Top} />
      Server
      <Handle
        key={1}
        id={'1'}
        position={Position.Bottom}
        isValidConnection={handleIsValidConnection}
        onConnect={(connection) => handleOnConnect(connection, Direction.DOWN)}
        type="source"
        isConnectableStart={true}
        isConnectableEnd={true} 
      />
      <Handle key={2} id={'2'} position={Position.Left} type="target" />
      <Handle key={3} id={'3'} position={Position.Right} isValidConnection={handleIsValidConnection} onConnect={(connection) => handleOnConnect(connection, Direction.RIGHT)} type="source"
        isConnectableStart={true}
        isConnectableEnd={true}  
      />
    </>);
}

export default memo(Server);
