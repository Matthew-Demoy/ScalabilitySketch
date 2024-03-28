import React, { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge } from 'reactflow';
import { EdgeData } from '../store/store';

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

  
  const latency = data.latency
  const packets = data.packets.map((packet,index) => {
    
    const progress = packet.t / latency

    const x = sourceX + (targetX - sourceX) * progress
    const y = sourceY + (targetY - sourceY) * progress

    return (
        <EdgeLabelRenderer
        key={index}>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${x}px,${y}px)`,
            background: '#ffcc00',
            padding: 10,
            borderRadius: 5,
            fontSize: 12,
            fontWeight: 700,
          }}
          className="nodrag nopan"
        >
          packet
        </div>
      </EdgeLabelRenderer>
    )
  })
  return (
    <>
      <BaseEdge id={id} path={edgePath} />
        {packets}
    </>
  );
};

export default Transfer;
