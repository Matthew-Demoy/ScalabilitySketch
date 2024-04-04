

import React from 'react';
import { Component } from '../nodes/types';


interface AddComponentProps {
  addComponent: (choice: Component) => void;
}

const AddComponent: React.FC<AddComponentProps> = ({ addComponent }) => {
  return (
    <div>
      <button onClick={() => addComponent(Component.CLIENT_CALL)}>Client</button>
      <button onClick={() => addComponent(Component.SERVER)}>Server</button>
      <button onClick={() => addComponent(Component.DATABASE)}>Database</button>
    </div>
  );
};

export default AddComponent;