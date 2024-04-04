import { useShallow } from 'zustand/react/shallow';
import ReactFlow, { ReactFlowInstance, useReactFlow } from 'reactflow';

import 'reactflow/dist/style.css';
import './index.css'

import useStore, { RFState } from './store/store';
import Client from './nodes/Client';
import Server from './nodes/Server';
import Database from './nodes/Database';
import { useEffect, useState } from 'react';
import Transfer from './edges/Transfer';
import { TimeScale, displayTime } from './core/time';
import NodeInfoList from './components/nodesInfoList';
import AddComponent from './components/addComponent';
import { Component } from './nodes/types';

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
  timeScale : state.timeScale,
  setNodes : state.setNodes,
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, time, setTimeScale, timeScale, setNodes } = useStore(
    useShallow(selector),
  );

  const { isRunning, tick } = useStore()
  
  const [reactFlowInstance, setReactFlowInstance] = useState(null as ReactFlowInstance | null);


  const onInit = (instance : ReactFlowInstance) => { setReactFlowInstance(instance) }

  useEffect(() => {
    if (isRunning) {
      const intervalId = setInterval(() => {
        tick();
      }, 1); // 1000 milliseconds = 1 second

      // Clear the interval when the component is unmounted or when isRunning becomes false
      return () => clearInterval(intervalId);
    }
  }, [isRunning])
  const viewPort = reactFlowInstance?.getViewport()
  const x = viewPort?.x || 0
  const y = viewPort?.y || 0
  console.log(x, y)
  const handleAddComponent = (choice : Component) => {

    const component = {
      id: nodes.length.toString(),
      type: choice,
      data: {
        componentName: choice,
        tasks: new Map()
      },
      position: { x : 1, y : 1 }
    }

    setNodes([...nodes, component])

  }
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
        <AddComponent addComponent={(choice) => handleAddComponent(choice)} />
      </div>
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={onConnect}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
      />
    </span>
  );
}

export default Flow;
