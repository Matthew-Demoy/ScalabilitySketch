import { useEffect, useState } from "react";
import { NodeData, isClient, isEndNode, isPipeNode } from "../nodes/types";
import { Node } from "reactflow";

interface NodeInfoListProps {
    nodes: Node<NodeData>[];
    features: string[]
    modifyFeaturesForClient : (nodeId: string,  features : { [string: string]: { callsPerDay: number } }) => void
}


function formatBytes(bytes : number, decimals = 2) {
    if (bytes === 0) return '0 Bytes';

    const k = 1024;
    const dm = decimals < 0 ? 0 : decimals;
    const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

    const i = Math.floor(Math.log(bytes) / Math.log(k));

    return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}


interface DisplayInfoListProps {
    node: Node<NodeData>
    features: string[]
    modifyFeaturesForClient : (nodeId: string,  features : { [string: string]: { callsPerDay: number } }) => void

}
const displayNodeMetada = ({node , modifyFeaturesForClient, features : allFeatures} : DisplayInfoListProps) => {

    if(isClient(node)){
        const removeFeature = (feature: string) => {
            const newFeatures = { ...node.data.features };
            delete newFeatures[feature];
            modifyFeaturesForClient(node.id, newFeatures);
        };

        const [isDropdownOpen, setIsDropdownOpen] = useState(false);
        const [availableFeatures, setAvailableFeatures] = useState<string[]>([]);
    
        useEffect(() => {
            // Assuming allFeatures is an array of all possible features
            const currentFeatures = Object.keys(node.data.features);
            let res = allFeatures.filter(feature => !currentFeatures.includes(feature))
            setAvailableFeatures(res);
        }, [node.data.features, allFeatures]);
    
        const handleCallsPerDayChange = (feature: string, callsPerDay: number) => {
            const newFeatures = { ...node.data.features, [feature]: { callsPerDay } };
            modifyFeaturesForClient(node.id, newFeatures);
        };

        const addFeature = (feature: string) => {
            const newFeatures = { ...node.data.features, [feature]: { callsPerDay: 0 } };
            modifyFeaturesForClient(node.id, newFeatures);
        };
        
        const features = Object.keys(node.data.features).map((feature) => {
            return (
                <div className="feature">
                    <button onClick={() => removeFeature(feature)}>x</button>
                    {feature} : {feature} : <input type="number" value={node.data.features[feature].callsPerDay} onChange={(e) => handleCallsPerDayChange(feature, Number(e.target.value))} />
                </div>
            )
        })
        return(
            <div>
                Client : {node.data.tasks.size} tasks
                {features}
                <button onClick={() => setIsDropdownOpen(!isDropdownOpen)}>Add Feature</button>
                {isDropdownOpen && (
                    <div className="dropdown">
                        {availableFeatures.map((feature) => (
                            <div onClick={() => addFeature(feature)}>{feature}</div>
                        ))}
                    </div>
                )}
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

const NodeInfoList: React.FC<NodeInfoListProps> = ({ nodes, modifyFeaturesForClient, features }) => {

    return (
        <div>
            {nodes.map((node) => displayNodeMetada({node, modifyFeaturesForClient, features}))}
        </div>
    );
};

export default NodeInfoList;
