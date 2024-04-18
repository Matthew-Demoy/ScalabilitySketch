import { Connection, NodeProps, Edge } from 'reactflow';
import '../../index.css'
import useStore, { RFState } from '../../store/store';
import { NodeType } from '..';
import { EdgeData, Message } from '../../edges/types';
import { TimeScale } from '../../core/time';
import { useState } from 'react';

function Process({ id, data }: NodeProps<undefined>) {
    const nodes = useStore((state) => state.nodes);
    const onConnect = useStore((state) => state.onConnect);
    const [call, setCall] = useState('');
    const process = useStore(state => state.processes.find(process => process.nodeId === id))
    
    if(!process) return null;


    
    const handleIsValidConnection = (connection: Connection): boolean => {
        const match = nodes.find((node) => node.id === connection.target)

        return match?.type === NodeType.DATABASE
    }
    const handleOnConnect = (connection: Connection) => {
        const Edge: Edge<EdgeData> = {
            id: `${id}-${connection.target}`,
            source: id,
            target: connection.target ?? "",
            type: "transfer",
            data: { messages: new Map<number, Message>(), latency: 2 * TimeScale.MILLISECOND },
        }

        onConnect(Edge)
    }

    enum Direction {
        UP = 'up',
        DOWN = 'down',
        LEFT = 'left',
        RIGHT = 'right'
    }

    const changeDirection = (direction: Direction, index: number) => {
        let newDirection: Direction = Direction.DOWN;
        if (direction === Direction.DOWN) {
            newDirection = Direction.LEFT;
        } else if (direction === Direction.LEFT) {
            newDirection = Direction.UP;
        } else if (direction === Direction.UP) {
            newDirection = Direction.RIGHT;
        }

        // Update the direction in the Zustand store
        useStore.setState((state: RFState) => {
            return {
                ...state,
                nodes: state.nodes.map((node) => {
                    if (node.id === id && isProcessNode(node)) {
                        node.data.calls[index].direction = newDirection;
                    }
                    return node;
                })
            }
        })
    }

    const getArrows = (direction: Direction) => {
        if (direction === Direction.DOWN) {
            return '↓'
        } else if (direction === Direction.LEFT) {
            return '←'
        } else if (direction === Direction.UP) {
            return '↑'
        }
        return '→'
    }

    const getDirectionButton = (direction: Direction, index: number) => {
        return (
            <button onClick={() => changeDirection(direction, index)}>
                {getArrows(direction)}
            </button>
        )
    }

    const handleRemoveClick = (index: number) => {
        process.subProcess.splice(index, 1)
    }

    const calls = process.subProcess.map((call, index) => {
        return (
            <div key={index}>
                {index + 1}. {call.query}  {getDirectionButton(call.direction, index)}
                <button onClick={() => handleRemoveClick(index)}>x</button>
            </div>
        )
    })

    const handleAddCall = () => {
        const newCall = {
            query: call,
            direction: Direction.DOWN
        }
        process.subProcess.push(newCall);
        setCall(''); // clear the input
    }

    return (
        <div className='componentBorder'>
            <b>
                {process.displayName}
            </b>
            <br></br>
            <button className='proccessToggle'>
                {process.memory} KB
            </button>
            <button className='proccessToggle'>
                {process.time} MS
            </button>
            {calls}

            <div>
                <input
                    type='text'
                    placeholder='Query'
                    value={call}
                    onChange={e => setCall(e.target.value)}
                    style={{ width: '50%' }}
                />
                <button disabled={!call} onClick={handleAddCall}>
                    + Call
                </button>
            </div>
        </div>);
}

export default Process;
