import React from 'react';
import { NodeType } from '../nodes';


interface AddComponentProps {
  addComponent: (choice: NodeType) => void;
}

const AddComponent: React.FC<AddComponentProps> = ({ addComponent }) => {
  return (
    <div>
      <button onClick={() => addComponent(NodeType.CLIENT)}>Client</button>
      <button onClick={() => addComponent(NodeType.SERVER)}>Server</button>
      <button onClick={() => addComponent(NodeType.DATABASE)}>Database</button>
    </div>
  );
};

export default AddComponent;