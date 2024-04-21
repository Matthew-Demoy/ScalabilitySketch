import { FC } from 'react';
import { EdgeProps, getBezierPath, EdgeLabelRenderer, BaseEdge, getSmoothStepPath } from 'reactflow';
import { EdgeData, Message } from './types';
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
  source,
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

  const messages : Message[] = useStore((state) => state.messages).filter((message) => message.edgeId == id)
  

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
  
  return (
    <>
      <BaseEdge id={id} path={edgePath}/>
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
            <div onClick={onEdgeClick} style={{cursor: 'pointer'}}>
              ×
              {id}----
              {source}-
              {target}
              <br></br>
              messages : {messages.length}
              
            </div>
          </div>
        </EdgeLabelRenderer>
    </>
  );
};

export default Transfer;
