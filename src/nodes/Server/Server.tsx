import { Connection, Handle, NodeProps, Position, Edge, useUpdateNodeInternals } from 'reactflow';
import '../../index.css'
import useStore from '../../store/store';
import { Direction, NodeData } from '../types';
import { EdgeData } from '../../edges/types';
import { TimeScale } from '../../core/time';
import "./Server.css"
import { memo, useEffect, useState } from 'react';
import ProcessComponent from '../../components/processComponent';

function Server({ id, data, selected, }: NodeProps<NodeData>) {
  const displayName = data.displayName;
  const nodes = useStore((state) => state.nodes);
  const onConnect = useStore((state) => state.onConnect);
  const subProcesses = useStore(state => state.processes.filter(process => process.parentNode == id))

  const createProcess = useStore(state => state.createProcess)

  const [isCollapsed, setIsCollapsed] = useState(false)

  const handleIsValidConnection = (connection: Connection): boolean => {
    const match = nodes.find((node) => node.id === connection.target)
    if (!match) return false
    console.log(connection)
    return true
  }

  const updateNodeInternals = useUpdateNodeInternals();

  useEffect(() => {
    updateNodeInternals(id);
  }, [id, updateNodeInternals, subProcesses.length]);


  const handleOnConnect = (connection: Connection, direction: Direction) => {
    //For the other handle get the id and the direction of based on the handle position
    const match = nodes.find((node) => node.id === connection.target)

    const Edge: Edge<EdgeData> = {
      id: `${id}_${direction}_${connection.target}_${connection.targetHandle}`,
      source: id,
      sourceHandle: connection.sourceHandle ?? "",
      targetHandle: connection.targetHandle ?? "",
      target: connection.target ?? "",
      type: "transfer",
      data: { latency: 2 * TimeScale.MILLISECOND },
    }


    const keysSet = subProcesses.reduce((keysSet, process) => {
      process.subProcess
        .filter(subProcess => subProcess.direction === direction)
        .forEach(subProcess => keysSet.add(subProcess.query));
      return keysSet;
    }, new Set<string>());

    const keys = Array.from(keysSet);

    keys.forEach(key => {
      if (connection.target == null) {
        return
      }
      createProcess(connection.target, key, key)
    })
    onConnect(Edge)
  }

  const handleAddProcess = () => {
    createProcess(id)
  }

  const processComponents = subProcesses.map((process) => {
    return <ProcessComponent process={process} />
  })
  return (
    <>
      <Handle id={Direction.UP} type="target" position={Position.Top} />
      {displayName ? displayName : 'Server'}
      <Handle
        key={1}
        id={Direction.DOWN}
        position={Position.Bottom}
        isValidConnection={handleIsValidConnection}
        onConnect={(connection) => handleOnConnect(connection, Direction.DOWN)}
        type="source"
        isConnectableStart={true}
        isConnectableEnd={true}
      />
      <Handle key={2} id={Direction.LEFT} position={Position.Left} type="target" />
      <Handle key={3} id={Direction.RIGHT} position={Position.Right} isValidConnection={handleIsValidConnection} onConnect={(connection) => handleOnConnect(connection, Direction.RIGHT)} type="source"
        isConnectableStart={true}
        isConnectableEnd={true}
      />

      <span className='addProcessButton'>
        <button onClick={() => handleAddProcess()}>+</button>
        <button onClick={() => setIsCollapsed(!isCollapsed)}>{isCollapsed ? '›' : '⌄'}</button>
      </span>

      {!isCollapsed ? processComponents : processComponents[0]}
    </>);
}

export default memo(Server);
