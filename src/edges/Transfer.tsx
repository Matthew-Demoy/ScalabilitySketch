import React, { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { Direction, EdgeData } from './types';
import { Component, TemplateLibrary } from '../nodes/types';

const Transfer: FC<EdgeProps<EdgeData>> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
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
      <BaseEdge id={id} path={edgePath} />
        {messages}
    </>
  );
};

export default Transfer;
