import '../index.css'
import useStore, { RFState } from '../store/store';
import { useState } from 'react';
import { Process as ProcessType } from '../nodes/types';

interface ProcessProps {
  process: ProcessType;
}


const Process: React.FC<ProcessProps> = (props) => {
    const { process } = props;
    const nodes = useStore((state) => state.nodes);
    const onConnect = useStore((state) => state.onConnect);
    const updateProcess = useStore((state) => state.updateProcess);
    const [call, setCall] = useState('');    
    
    if(!process) {
        console.error('Process not found')
        return null}


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
        
        updateProcess({ ...process, subProcess: process.subProcess.map((call, i) => i === index ? { ...call, direction: newDirection } : call) })
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

    const handleMaxSpawnsChange = (value: string) => {

        if(process.spawnInfo === null) {
            return
        }
        const newProcess = { ...process, spawnInfo: { ...process.spawnInfo, maxSpawns: Number(value) } };
        updateProcess(newProcess);
    }
    
    const handleMsBetweenSpawnsChange = (value: string) => {
        if(process.spawnInfo === null) {
            return
        }
        const newProcess = { ...process, spawnInfo: { ...process.spawnInfo, msBetweenSpawns: Number(value) } };        
        updateProcess(newProcess);
    }

    const handleStorageChange = (value: string) => {
        const newProcess = { ...process, storage: Number(value) };
        updateProcess(newProcess);
    }

    const handleMemoryChange = (value: string) => {
        const newProcess = { ...process, memory: Number(value) };
        updateProcess(newProcess);
    }

    const handleTimeChange = (value: string) => {
        const newProcess = { ...process, time: Number(value) };
        updateProcess(newProcess);
    }

    const spawnInfoFields = process.spawnInfo ? (
        <>
            <label>
                Max Spawns:
                <input
                    type='number'
                    
                    value={process.spawnInfo.maxSpawns}
                    onChange={e => handleMaxSpawnsChange(e.target.value)}
                />
            </label>
            <label>
                Ms Between Spawns:
                <input
                    type='number'
                    value={process.spawnInfo.msBetweenSpawns}
                    onChange={e => handleMsBetweenSpawnsChange(e.target.value)}
                />
            </label>
        </>
    ) : null;

    const initializeSpawnInfo = process.spawnInfo === null ? (
        <button onClick={() => updateProcess({ ...process, spawnInfo: { msBetweenSpawns: 1, maxSpawns: 3, totalSpawns: 0 } })}>
            Initialize Spawn Info
        </button>
    ) : null;
    return (
        <div className='componentBorder'>
            <b>
                {process.displayName + ' '} 
            </b>
            <br/>
            <label>
                Memory (KB):
                <input
                    type='number'
                    
                    value={process.memory}
                    onChange={e => handleMemoryChange(e.target.value)}
                />
            </label>

            <label>
                Time (MS):
                <input
                    type='number'
                    
                    value={process.time}
                    onChange={e => handleTimeChange(e.target.value)}
                />
            </label>

            <label>
                Storage (KB):
                <input
                    type='number'
                    value={process.storage}
                    onChange={e => handleStorageChange(e.target.value)}
                />
            </label>
            
            
            {spawnInfoFields}
            {initializeSpawnInfo}
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
