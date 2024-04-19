import { expect, test } from 'vitest'
import useStore from '../store/store';
import { act, renderHook } from '@testing-library/react';

import App from '../App';
import { AddUser, Direction, GetOrg, Process } from '../nodes/types';

describe("useIncrementingStore", () => {
    const getStore = () => {
        return renderHook(() => useStore())
    }


    it("threads without callingThread should terminate", () => {
        let store = getStore()

        const process: Process = {
            nodeId: 'p1',
            id: 'p1',
            displayName: 'Add User',
            key: AddUser,
            memory: 100,
            time: 5,
            storage: 0,
            subProcess: [
            ]
        }

        act(() => {
            store.result.current.updateProcess(process)
            store.result.current.createThread(null, 's1', AddUser)
        })

        expect(store.result.current.processes[0].subProcess.length).equal(0)
        expect(store.result.current.threads.length).equal(1)

        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(0)

    });

    it("threads should call the next process", () => {
        let store = getStore();

        const process: Process = {
            nodeId: 'p2',
            id: 'p2',
            displayName: 'Add User',
            key: AddUser,
            memory: 100,
            time: 5,
            storage: 0,
            subProcess: [
            ]
        }

        act(() => {
            store.result.current.updateProcess(process)
            store.result.current.createThread(null, 's1', AddUser)
        })

        act(() => {
            store.result.current.tick()
            store.result.current.tick()
            store.result.current.tick()
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(2)
        expect(store.result.current.messages.length).equal(0)
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(1)
        expect(store.result.current.messages.length).equal(1)
        act(() => {
            store.result.current.tick()
            store.result.current.tick()
            store.result.current.tick()
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(0)
        expect(store.result.current.messages.length).equal(0)

    });


    it("a single thread should be able to spawn multiple processes across nodes", () => {
        let store = getStore();

        const process: Process = {
            nodeId: 'p2',
            id: 'p2',
            displayName: 'Add User',
            key: AddUser,
            memory: 100,
            time: 5,
            storage: 0,
            subProcess: [
                {
                    query: GetOrg,
                    direction: Direction.RIGHT
                },
                {
                    query: AddUser,
                    direction: Direction.DOWN
                }
            ]
        }

        act(() => {
            store.result.current.updateProcess(process)
            store.result.current.createThread(null, 's2', AddUser)
        })


        act(() => {
            store.result.current.tick()
            store.result.current.tick()
            store.result.current.tick()
            store.result.current.tick()            
        })

        expect(store.result.current.threads.length).equal(2)
        expect(store.result.current.messages.length).equal(0)

        act(() => {
            store.result.current.tick()
            store.result.current.tick()                         
            store.result.current.tick()                         
            store.result.current.tick()                         
            store.result.current.tick()                         
            store.result.current.tick()  
            store.result.current.tick()        
            store.result.current.tick()                                                                
        })

        expect(store.result.current.threads.length).equal(2)
        expect(store.result.current.messages.length).equal(0)

        act(() => {
            store.result.current.tick()
            store.result.current.tick()                         
            store.result.current.tick()       
        })


        expect(store.result.current.threads.length).equal(1)
        expect(store.result.current.messages.length).equal(1)


        act(() => {
            store.result.current.tick()
        })
        
        expect(store.result.current.threads.length).equal(1)
        expect(store.result.current.messages.length).equal(0)

        act(() => {
            store.result.current.tick()
            store.result.current.tick()                         
            store.result.current.tick()       
        })

        console.log("threads ", store.result.current.threads)
        console.log("messages ", store.result.current.messages)


        expect(store.result.current.threads.length).equal(0)
        expect(store.result.current.messages.length).equal(0)

    });

    afterEach(() => {
        let store = getStore();
        store.result.current.resetState()
    })

});