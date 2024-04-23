import { expect, test } from 'vitest'
import useStore from '../store/store';
import { act, renderHook } from '@testing-library/react';

import App from '../App';
import { AddUser, Direction, GetOrg, Process } from '../nodes/types';
import { addUserClient, addUserClientWCalls, addUserClientWSpawn, addUserProcess } from '../store/initialState/process';

describe("initializing state and properly simulate with tick()", () => {
    const getStore = () => {
        return renderHook(() => useStore())
    }

    it("threads without callingThread should terminate", () => {
        let store = getStore()
        console.log("global counter", store.result.current.globalCounter)
        act(() => {
            store.result.current.updateProcess(addUserClient)
            store.result.current.createThread(null, 's1', AddUser)
        })

        expect(store.result.current.processes[0].subProcess.length).equal(0)
        expect(store.result.current.threads.length).equal(1)

        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(0)
        console.log("global counter", store.result.current.globalCounter)
    });

    it("threads should call the next process", () => {
        let store = getStore();

        act(() => {
            store.result.current.updateProcess(addUserClientWCalls)
            store.result.current.updateProcess(addUserProcess)
            store.result.current.createThread(null, 's1', AddUser)
        })

        act(() => {
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
        })
        expect(store.result.current.threads.length).equal(0)
        expect(store.result.current.messages.length).equal(0)

    });


    it("a single thread should be able to spawn multiple processes across nodes", () => {
        let store = getStore();

        act(() => {
            store.result.current.updateProcess(addUserClientWCalls)            
            store.result.current.createThread(null, 's2', AddUser)
        })


        act(() => {
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
        })
        
        expect(store.result.current.threads.length).equal(1)
        expect(store.result.current.messages.length).equal(0)

        act(() => {
            store.result.current.tick()
            store.result.current.tick()                         
            store.result.current.tick()       
        })

        expect(store.result.current.threads.length).equal(0)
        expect(store.result.current.messages.length).equal(0)

    });

    afterEach(() => {
        let store = getStore();
        store.result.current.resetState()
    })

    /* This test is long winded but system designs can be fairly complex. 
     * Luckily our internal representation of a system architecture is deterministic 
     * so we can use fine grain tests to give us confidence our app is working 
     * 
     * Just checking messages and thread counts, but this should catch core logic errors.
     * If a message does not get passed to the correct node, or a duplicate of either a thread/message is created
     * this test will catch it.
     */
    it('A process should spawn threads, and those threads spawn threads >:)', () => {
        let store = getStore();
    
        act(() => {
            store.result.current.updateProcess(addUserClientWSpawn)                        
        })
    
        expect(store.result.current.threads.length).equal(0)
        expect(store.result.current.messages.length).equal(0)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(1)
        expect(store.result.current.messages.length).equal(0)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(2)
        expect(store.result.current.messages.length).equal(1)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(4)
        expect(store.result.current.messages.length).equal(1)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(5)
        expect(store.result.current.messages.length).equal(2)

        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(7)
        expect(store.result.current.messages.length).equal(1)

        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(7)
        expect(store.result.current.messages.length).equal(2)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(7)
        expect(store.result.current.messages.length).equal(1)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(6)
        expect(store.result.current.messages.length).equal(2)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(7)
        expect(store.result.current.messages.length).equal(2)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(8)
        expect(store.result.current.messages.length).equal(2)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(8)
        expect(store.result.current.messages.length).equal(3)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(8)
        expect(store.result.current.messages.length).equal(4)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(8)
        expect(store.result.current.messages.length).equal(5)

        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(8)
        expect(store.result.current.messages.length).equal(5)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(7)
        expect(store.result.current.messages.length).equal(5)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(6)
        expect(store.result.current.messages.length).equal(4)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(5)
        expect(store.result.current.messages.length).equal(3)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(4)
        expect(store.result.current.messages.length).equal(2)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(3)
        expect(store.result.current.messages.length).equal(1)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(2)
        expect(store.result.current.messages.length).equal(1)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(1)
        expect(store.result.current.messages.length).equal(0)
    
        act(() => {
            store.result.current.tick()
        })
        expect(store.result.current.threads.length).equal(0)
        expect(store.result.current.messages.length).equal(0)
    });

});