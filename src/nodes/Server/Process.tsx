import { Connection, NodeProps, Edge } from 'reactflow';
import '../../index.css'
import useStore from '../../store/store';
import { AddUser, ProcessData } from '../types';
import { NodeType } from '..';
import { EdgeData, Message } from '../../edges/types';
import { TimeScale } from '../../core/time';
import { useState } from 'react';

function Process({ id, data }: NodeProps<ProcessData>) {
    const nodes = useStore((state) => state.nodes);
    const onConnect = useStore((state) => state.onConnect);
    const [call, setCall] = useState('');
    
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
    
    const changeDirection = (direction: Direction) => {
        if(direction === Direction.DOWN) {
            return Direction.LEFT
        } else if(direction === Direction.LEFT) {
            return Direction.UP
        } else if(direction === Direction.UP) {
            return Direction.RIGHT
        }
        return Direction.DOWN
    }
    
    const getArrows = (direction: Direction) => {
        if(direction === Direction.DOWN) {
            return '↓'
        } else if(direction === Direction.LEFT) {
            return '←'
        } else if(direction === Direction.UP) {
            return '↑'
        }
        return '→'
    }

    const getDirectionButton = (direction: Direction) => {
        return (
            <button onClick={() => changeDirection(direction)}>
                {getArrows(direction)}
            </button>
        )
    }

    const handleRemoveClick = (index : number) => {
        data.calls.splice(index, 1)
    }
        
    const calls = data.calls.map((call, index) => {
        return (
            <div key={index}>
                {index + 1}. {call.query}  {getDirectionButton(call.direction)} 
                <button onClick={() => handleRemoveClick(index)}>x</button>
            </div>
        )
    })

    const handleAddCall = () => {
        const newCall = {
            query: call,
            direction: Direction.DOWN
        }
        data.calls.push(newCall);
        setCall(''); // clear the input
    }

    return (
        <div className='componentBorder'>
            <b>
               {data.displayName}
            </b>
            <br></br>
            <button className='proccessToggle'>
                {data.memory} KB
            </button>
            <button className='proccessToggle'>
                {data.time} MS
            </button>
            {calls}
            
            <div>
                <input 
                    type='text' 
                    placeholder='Query' 
                    value={call} 
                    onChange={e => setCall(e.target.value)}
                    style={{width: '50%'}}
                />
                <button disabled={!call} onClick={handleAddCall}>
                    + Call
                </button>
            </div>
        </div>);
}

export default Process;
