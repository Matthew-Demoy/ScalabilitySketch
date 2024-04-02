import { useShallow } from 'zustand/react/shallow';
import ReactFlow from 'reactflow';

import 'reactflow/dist/style.css';
import './index.css'

import useStore, { RFState } from './store/store';
import Client from './nodes/Client';
import Server from './nodes/Server';
import Database from './nodes/Database';
import { useEffect } from 'react';
import Transfer from './edges/Transfer';
import { TimeScale, displayTime } from './core/time';
import NodeInfoList from './components/nodesInfoList';

const nodeTypes = { client : Client, server: Server, database: Database };
const edgeTypes = {transfer: Transfer}

const selector = (state : RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  time: state.time,
  setTimeScale: state.updateTimeScale,
  timeScale : state.timeScale
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, time, setTimeScale, timeScale } = useStore(
    useShallow(selector),
  );

  const { isRunning, tick } = useStore()

  
  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        tick();
      }, 1); // 1000 milliseconds = 1 second

      // Clear the interval when the component is unmounted or when isRunning becomes false
      return () => clearInterval(intervalId);
    }
  }, [isRunning])

  

  //Every 10 seconds I want to call a zustand action that will have the faucet node shoot info

  return (
    <span>
      <div className={'buttonContainer'}>
        Time : {displayTime(time)}
        
        <div>
          <button disabled={timeScale == TimeScale.MICROSECOND} onClick={() => setTimeScale(TimeScale.MICROSECOND)} > .001X</button>
          <button disabled={timeScale == TimeScale.MILLISECOND} onClick={() => setTimeScale(TimeScale.MILLISECOND)}> 1X</button>
          <button disabled={timeScale == TimeScale.SECOND} onClick={() => setTimeScale(TimeScale.SECOND)}> 1000X</button>
        </div>

        {isRunning ? <button className={'stopButton'} onClick={() => useStore.getState().resetSimulation()}>Stop</button> 
        : <button className={'startButton'} onClick={() => useStore.getState().startSimulation()}>Start</button>}

        {NodeInfoList({nodes : nodes})}
      </div>
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
