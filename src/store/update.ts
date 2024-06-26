import { DatabaseData, ProcessData, TaskStatus } from "../nodes/types";
import { ComponentUpdate, StoreGet, StoreSet, UpdateNode } from "./store";
import {Node} from 'reactflow'

const createUpdateHelpers = (set : StoreSet, get: StoreGet) => {

    const updateNode = (updatedNode : Node) => {
        set({
            nodes: get().nodes.map((node) => {
                if (node.id == updatedNode.id) {
                    return updatedNode
                }
                return node

            })
        })
    }
    const updateProcessNode = (processNode : Node<ProcessData>, update : UpdateNode) => {
        const process = processNode.data.processes.get(update.id)        
        processNode.data.processes.set(update.id, 
            { t: 0, status: TaskStatus.PROCESS_IN, 
            callIndex: process ? process.callIndex + 1 : 0, 
            callingEdge: process ? process.callingEdge : update.creatingId,
            callingProcess: process ? process.callingProcess : update.templateName
        })
        updateNode(processNode)
    }

    const updateDatabaseNode = (databaseNode : Node<DatabaseData>, update : UpdateNode) => {
        let status = databaseNode.data.tasks.get(update.id)?.status || TaskStatus.PROCESS_IN
        status = status == TaskStatus.WAITING ? TaskStatus.PROCESS_OUT : status
        const newTasks = new Map(databaseNode.data.tasks);

        const existingTask = newTasks.get(update.id)

        newTasks.set(update.id, { id: update.id, 
            t: 0, status, 
            templateName : update.templateName, callingEdge: existingTask ? existingTask.callingEdge : update.creatingId });
        databaseNode.data.tasks = newTasks;

        updateNode(databaseNode)
    }

    return { updateProcessNode, updateDatabaseNode }
}

export default createUpdateHelpers
