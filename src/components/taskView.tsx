import React, { useState } from 'react';
import { Component, TaskMetadata } from '../nodes/types';
import { TaskLibrary } from '../nodes/types';


interface TasksViewProps {
    taskLibrary: TaskLibrary
    modifyTasks: (updatedLibrary: TaskLibrary) => void
}

const TaskView: React.FC<TasksViewProps> = (props) => {

    const { taskLibrary: library, modifyTasks } = props;

    const handleEdit = (taskName: string, component: Component, key: string, value: number) => {
        const updatedLibrary = new Map(library);

        const taskData = updatedLibrary.get(taskName);
        if (taskData) {
            const metadata = taskData.get(component);
            if (metadata) {
                const updatedMetadata = { ...metadata, [key]: value };
                taskData.set(component, updatedMetadata);
                updatedLibrary.set(taskName, taskData);
                modifyTasks(updatedLibrary);
            }
        }
    };

    const handleDuplicate = (taskName: string) => {
        const updatedLibrary = new Map(library);
        const taskData = library.get(taskName);
        if (taskData) {
            const newTaskName = `${taskName}_copy`;
            updatedLibrary.set(newTaskName, new Map(taskData));
            modifyTasks(updatedLibrary);
        }
    };

    return (
        <div >
            {Array.from(library.entries()).map(([taskName, taskData]) => (
                <div key={taskName} className="task">
                    <div className="task-title">
                        <h2>{taskName}</h2>
                        <button onClick={() => handleDuplicate(taskName)}>Duplicate</button>
                    </div>
                    {Array.from(taskData.entries()).map(([component, data]) => (
                        <div className="component">
                            {component}{' '}
                            {Object.entries(data).map(([key, value]) => (
                                <div key={key} className="data-entry">
                                    <label>{key}</label>
                                    <input
                                        type="number"
                                        value={value || ''}
                                        onChange={(e) => handleEdit(taskName, component, key, Number(e.target.value))}
                                    />
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            ))}
        </div>
    );
};

export default TaskView;