import { AddUser, Task, TaskStatus } from "../nodes/types";


const SQLWrite : Task = {
    t: 0,
    id: 0,
    status: TaskStatus.PROCESS_IN,
    templateName: AddUser
}


export { SQLWrite }