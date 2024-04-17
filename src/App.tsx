import { useShallow } from 'zustand/react/shallow';
import ReactFlow, { ReactFlowInstance } from 'reactflow';

import 'reactflow/dist/style.css';
import './index.css'

import useStore, { RFState } from './store/store';
import Client from './nodes/Client';
import Server from './nodes/Server/Server';
import Database from './nodes/Database';
import { useEffect, useState } from 'react';
import Transfer from './edges/Transfer';
import { TimeScale, displayTime } from './core/time';
import NodeInfoList from './components/nodesInfoList';
import AddComponent from './components/addComponent';
import { Component } from './nodes/types';
import TaskView from './components/taskView';
import Process from './nodes/Server/Process';

const nodeTypes = { client: Client, server: Server, database: Database, process: Process};
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
  taskLibrary: state.taskLibrary,
  modifyTasks: state.modifyTasks,
  modifyFeaturesForClient: state.modifyFeaturesForClient
});

function Flow() {
  const { nodes, edges, onNodesChange, onEdgesChange, onConnect, time, setTimeScale, timeScale, setNodes, taskLibrary, modifyTasks, modifyFeaturesForClient } = useStore(
    useShallow(selector),
  );

  const features = Array.from(taskLibrary.keys()).map((task) => task)
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


  const handleAddComponent = (choice: Component) => {

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

  return (
    <span>
      <div className={'buttonContainer'}>
        Time : {displayTime(time)}

        <div>
          <button disabled={timeScale == TimeScale.MICROSECOND * 10} onClick={() => setTimeScale(TimeScale.MICROSECOND * 10)} > .01X</button>
          <button disabled={timeScale == TimeScale.MILLISECOND} onClick={() => setTimeScale(TimeScale.MILLISECOND)}> 1X</button>
          <button disabled={timeScale == TimeScale.SECOND} onClick={() => setTimeScale(TimeScale.SECOND)}> 1000X</button>
        </div>

        {isRunning ? <button className={'stopButton'} onClick={() => useStore.getState().resetSimulation()}>Stop</button>
          : <button className={'startButton'} onClick={() => useStore.getState().startSimulation()}>Start</button>}

        <NodeInfoList  nodes={nodes} features={features} modifyFeaturesForClient={modifyFeaturesForClient}/>
        <AddComponent addComponent={(choice) => handleAddComponent(choice)} />

        <div className='dropdown-button-container'>
          <h2>
            Tasks

          </h2>
          <button onClick={() => setIsTaskViewOpen(!isTaskViewOpen)}>
              {isTaskViewOpen ? '\\/' : '<'}
            </button>

        </div>
        {isTaskViewOpen && (
            <TaskView taskLibrary={taskLibrary} modifyTasks={modifyTasks} />
          )}
       
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

export default Flow;
