import { Connection, Handle, NodeProps, Position, Edge, useUpdateNodeInternals } from 'reactflow';
import '../../index.css'
import useStore from '../../store/store';
import { Direction } from '../types';
import { EdgeData } from '../../edges/types';
import { TimeScale } from '../../core/time';
import "./Server.css"
import { memo, useEffect } from 'react';
import ProcessComponent from '../../components/processComponent';

function Server({ id, data, selected }: NodeProps<undefined>) {
  const nodes = useStore((state) => state.nodes);
  const onConnect = useStore((state) => state.onConnect);
  const subProcesses = useStore(state => state.processes.filter(process => process.parentNode == id))

  const createProcess = useStore(state => state.createProcess)

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

    onConnect(Edge)
  }

  const handleAddProcess = () => {
    console.log("Adding process",)
    createProcess(id)
  }
  
  const processComponents = subProcesses.map((process) => {
    return <ProcessComponent process={process} />
  })
  return (
    <>      
      <Handle id={Direction.UP} type="target" position={Position.Top} />
      Server
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
      
        {processComponents}
      
      <button className='addProcessButton' onClick={() => handleAddProcess()}>+</button>
    </>);
}

export default memo(Server);
