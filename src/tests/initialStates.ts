import { NodeType } from "../nodes"


const createNodes = (n: number) => {
    let nodes = []
    for(let i = 0; i < n; i++) {
        nodes.push({
            id: `s${i}`,
            type: NodeType.SERVER,
            position: { x: 0, y: -100 },
            className: 'componentBorder server'
          })
        nodes.push(
          {
            id: `p${i}`,
            type: NodeType.PROCESS,
            position: { x: 20, y: 60 },
            parentNode: `s${i}`,
            extent: 'parent',
          }
        )
    }

    return nodes
}
