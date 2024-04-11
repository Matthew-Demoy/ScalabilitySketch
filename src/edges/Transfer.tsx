import { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { Direction, EdgeData } from './types';
import { Component, TemplateLibrary, isProcessNode } from '../nodes/types';
import useStore from '../store/store';

const Transfer: FC<EdgeProps<EdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  target,
  data,
}) => {
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });

  let messages : any = [];

  const setEdges = useStore((state) => state.setEdges);
  const setNodes = useStore((state) => state.setNodes);
  const edges = useStore((state) => state.edges);
  const nodes = useStore((state) => state.nodes);

  const onEdgeClick = () => {
    
    const filtered = edges.filter((edge) => edge.id !== id);
    setEdges(filtered);

    const filteredNodes = nodes.filter((node) => {
      
      // Delete process nodes that share the same feature name and are a child of the connected parent
      if(isProcessNode(node)){
        return !(node.data.name == data.name && target == node.parentNode)
      }
      return true
    })
    setNodes(filteredNodes)
  };
  
  data?.messages.forEach((message, messageId) => {
    
      const latency = TemplateLibrary.get(message.templateName)?.get(message.direction == Direction.TARGET ? Component.CLIENT_CALL : Component.SERVER_RESPONSE)?.time || 0

      const progress = message.t  / latency 

      const color = message.direction == Direction.TARGET ? '#ffcc00' : 'red';
      const position = message.direction == Direction.TARGET ? "140" : "0";


      //const x = message.direction == Direction.TARGET ? sourceX + (targetX - sourceX) * progress : sourceX + (targetX - sourceX) * (1 - progress);
      const x = message.direction == Direction.TARGET ? sourceX + (targetX - sourceX) * progress : sourceX + (targetX - sourceX) * (1 - progress)
      const y =  message.direction == Direction.TARGET ? sourceY + (targetY - sourceY) * progress : sourceY + (targetY - sourceY) * (1 - progress )
  
      messages.push(
          <EdgeLabelRenderer
          key={messageId}>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-${position}%, -50%) translate(${x}px,${y}px)`,
              background: color,
              padding: 10,
              borderRadius: 5,
              fontSize: 12,
              fontWeight: 700,
            }}
            className="nodrag nopan"
          >
            {message.templateName}
          </div>
        </EdgeLabelRenderer>
      )
  })
  return (
    <>
      <BaseEdge id={id} path={edgePath}/>
        {messages}
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              fontSize: 12,
              pointerEvents: 'all',
            }}
            className="nodrag nopan"
          >
            <button onClick={onEdgeClick}>
              ×
            </button>
          </div>
        </EdgeLabelRenderer>
    </>
  );
};

export default Transfer;
