import { NodeData, isClient, isEndNode, isPipeNode } from "../nodes/types";
import { Node } from "reactflow";

interface NodeInfoListProps {
    nodes: Node<NodeData>[];
}


function formatBytes(bytes : number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

const displayNodeMetada = (node: Node<NodeData>) => {
    if(isClient(node)){
        return(
            <div>
                Client : {node.data.tasks.size} tasks
            </div>
        )
    }else if(isPipeNode(node)){
        return(
            <div>
                Server : {node.data.tasks.size} tasks
            </div>
        )
    }else if(isEndNode(node)){
        return(
            <div>
                Database : {formatBytes(node.data.total)}
            </div>
        )
    }
}

const NodeInfoList: React.FC<NodeInfoListProps> = ({ nodes }) => {

    return (
        <div>
            {nodes.map((node) => displayNodeMetada(node))}
        </div>
    );
};

export default NodeInfoList;
