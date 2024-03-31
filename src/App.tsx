import { useShallow } from 'zustand/react/shallow';
import ReactFlow from 'reactflow';

import 'reactflow/dist/style.css';
import './index.css'

import useStore from './store/store';
import ColorChooserNode from './nodes/ColorChooserNode';
import FaucetNode from './nodes/Client';
import PipeNode from './nodes/Server';
import EndNode from './nodes/Database';
import { useEffect } from 'react';
import Transfer from './edges/Transfer';

const nodeTypes = { colorChooser: ColorChooserNode, faucet: FaucetNode, pipe: PipeNode, end: EndNode };
const edgeTypes = {transfer: Transfer}

const selector = (state) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect } = useStore(
    useShallow(selector),
  );

  const { isRunning, tick } = useStore()

  //I want to call tick every second if isRunning is true
  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        // Call your Zustand action here
        tick();
      }, 1000); // 10000 milliseconds = 10 seconds

      // Clear the interval when the component is unmounted or when isRunning becomes false
      return () => clearInterval(intervalId);
    }
  }, [isRunning])

  

  //Every 10 seconds I want to call a zustand action that will have the faucet node shoot info

  return (
    <span>
      {isRunning ? <button className={'stopButton'} onClick={() => useStore.getState().resetSimulation()}>Stop</button> 
      : <button className={'startButton'} onClick={() => useStore.getState().startSimulation()}>Start</button>}

      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
      />
    </span>
  );
}

export default Flow;
