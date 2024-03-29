export enum Direction {
    DESTINATION,
    SOURCE
}
interface Message {
    direction : Direction
    id : number
    t : number
}

export interface EdgeData {
    messages : Map<number, Message>,
    latency : number
}
