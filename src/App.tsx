import { useShallow } from 'zustand/react/shallow';
import ReactFlow, { ReactFlowInstance, ReactFlowProvider } from 'reactflow';

import 'reactflow/dist/style.css';
import './index.css'

import useStore, { RFState } from './store/store';
import Client from './nodes/Client';
import Server from './nodes/Server/Server';
import Database from './nodes/Database';
import { useEffect, useState } from 'react';
import Transfer from './edges/Transfer';
import { TimeScale, displayTime } from './core/time';
import Process from './nodes/Server/Process';
import { ThreadStatus } from './nodes/types';
import useAutoLayout, { type LayoutOptions } from './layout/useLayout';
import React from 'react';

const nodeTypes = { client: Client, server: Server, database: Database, process: Process };
const edgeTypes = { transfer: Transfer }

const selector = (state: RFState) => ({
  nodes: state.nodes,
  edges: state.edges,
  onNodesChange: state.onNodesChange,
  onEdgesChange: state.onEdgesChange,
  onConnect: state.onConnect,
  time: state.time,
  setTimeScale: state.updateTimeScale,
  timeScale: state.timeScale,
  setNodes: state.setNodes,
  threads: state.threads,
  messages: state.messages
});

function Flow() {  
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, time, setTimeScale, timeScale, setNodes, threads, messages } = useStore(
    useShallow(selector),
  );

  const layoutOptions = React.useMemo(() => ({
    algorithm: 'elk' as LayoutOptions['algorithm'],
    direction: 'LR',
    spacing: [50, 50],
  }), []); 
  // this hook handles the computation of the layout once the elements or the direction changes
  useAutoLayout(layoutOptions);
  
  const runningProcessCount = threads.filter(t => t.status === ThreadStatus.RUNNING).length
  const requests = threads.filter(t => t.callingThreadId == null).length

  const { isRunning, tick } = useStore()

  const [reactFlowInstance, setReactFlowInstance] = useState(null as ReactFlowInstance | null);
  

  const onInit = (instance: ReactFlowInstance) => { setReactFlowInstance(instance) }

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
  const [isTaskViewOpen, setIsTaskViewOpen] = useState(false);


  const handleAddComponent = (choice: any) => {

    const component = {
      id: (nodes.length + 1).toString(),
      type: choice,
      data: {
        componentName: choice,
        tasks: new Map(),
        total: choice === Component.DATABASE ? 0 : undefined
      },
      position: { x: 1, y: 1 }
    }

    setNodes([...nodes, component])

  }

  const handleStepForward = () => {
    tick()
  }



  return (
    <span>
      <div className={'buttonContainer'}>
        Time : {displayTime(time)}

        <div>
          <button disabled={timeScale == TimeScale.MICROSECOND * 10} onClick={() => setTimeScale(TimeScale.MICROSECOND * 10)} > .01X</button>
          <button disabled={timeScale == TimeScale.MILLISECOND} onClick={() => setTimeScale(TimeScale.MILLISECOND)}> 1X</button>
          <button disabled={timeScale == TimeScale.SECOND} onClick={() => setTimeScale(TimeScale.SECOND)}> 1000X</button>
        </div>
        <div>
          Running Threads {runningProcessCount} / {threads.length}
          <br />
          Messages {messages.length}
          <br />
          Origin Threads {requests}
        </div>
        {isRunning ? <button className={'stopButton'} onClick={() => useStore.getState().resetSimulation()}>Stop</button>
          : <button className={'startButton'} onClick={() => useStore.getState().startSimulation()}>Start</button>}
        {<button disabled={isRunning} onClick={() => handleStepForward()}>Step Forward</button>}
      </div>
      
      <ReactFlow
        nodes={nodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onInit={onInit}
        fitView
      />
    </span>
  );
}


const WrappedFlow = () => {
  return (
    <ReactFlowProvider>
      <Flow />
    </ReactFlowProvider>
  )
}
export default WrappedFlow;
