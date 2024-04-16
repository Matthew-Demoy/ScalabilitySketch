import { Connection, Handle, NodeProps, Position, Edge, NodeResizer, useUpdateNodeInternals } from 'reactflow';
import '../../index.css'
import useStore from '../../store/store';
import { Direction, NodeData, ProcessData, ServerData, isEndNode, isPipeNode, isProcessNode } from '../types';
import { NodeType } from '..';
import { EdgeData, Message } from '../../edges/types';
import { TimeScale } from '../../core/time';
import "./Server.css"
import { memo, useEffect } from 'react';
import { Node } from 'reactflow';

function Server({ id, data, selected }: NodeProps<ServerData>) {
  const nodes = useStore((state) => state.nodes);
  const onConnect = useStore((state) => state.onConnect);

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
  const children = nodes.filter((node): node is Node<ProcessData> => node.type === NodeType.PROCESS && node.parentNode === id)

  let leftHandle = false;
  let rightHandle = false;
  let topHandle = false;
  let bottomHandle = false;

  children.forEach((child) => {
    child.data.calls.forEach((call) => {
      if (call.direction === "up") {
        topHandle = true;
      } else if (call.direction === "down") {
        bottomHandle = true;
      } else if (call.direction === "left") {
        leftHandle = true;
      } else if (call.direction === "right") {
        rightHandle = true;
      }
    })
  })
  
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
