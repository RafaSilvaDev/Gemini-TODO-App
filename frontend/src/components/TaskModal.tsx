import React, { useState } from "react";
import "../pages/stylesheet/TaskModal.css";
import Todo from "../models/Todo";

interface TaskModalProps {
  onClose: () => void;
  onSave: (task: Todo) => void;
  onDelete: (taskId: string) => void;
  task?: Todo | null;
}

const TaskModal: React.FC<TaskModalProps> = ({
  onClose,
  onSave,
  onDelete,
  task,
}) => {
  const [title, setTitle] = useState(task?.title || "");
  const [description, setDescription] = useState(task?.description || "");
  const [status, setStatus] = useState(task?.status || "pending");
  const [dueDate, setDueDate] = useState(
    task?.dueDate
      ? new Date(task.dueDate).toISOString().split("T")[0] // Format date correctly
      : ""
  );

  const handleSave = () => {
    onSave({
      title,
      description,
      dueDate,
      status,
      userId: task?.userId || "",
      _id: task?._id || "",
    });
    onClose();
  };

  const handleDelete = () => {
    if (task?._id) {
      onDelete(task._id);
      onClose();
    }
  };

  return (
    <div className="modal-content">
      <div className="modal-header">
        <h2>{task ? "Edit Task" : "Create Task"}</h2>
        <button onClick={onClose} className="close-button">
          X
        </button>
      </div>
      <label htmlFor="title">Title:</label>
      <input
        type="text"
        id="title"
        value={title}
        onChange={(e) => setTitle(e.target.value)}
        required
      />
      <label htmlFor="description">Description:</label>
      <textarea
        id="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
      />
      <label htmlFor="task-due-date">Task due date:</label>
      <input
        type="date"
        id="task-due-date"
        value={dueDate}
        required
        min={task ? task.dueDate : new Date().toISOString().split("T")[0]}
        onChange={(e) => setDueDate(e.target.value)}
      />
      {task ? (
        <>
          <label htmlFor="task-status">Task status:</label>
          <select
            name="status"
            id="task-status"
            required
            value={status}
            onChange={(e) => setStatus(e.target.value)} // Update status state
          >
            <option value="pending">Pending</option>
            <option value="in-progress">In Progress</option>
            <option value="completed">Completed</option>
          </select>
        </>
      ) : null}
      <button onClick={handleSave} className="save-button">
        Save
      </button>
      <button onClick={handleDelete} className="delete-button">
        Delete
      </button>
    </div>
  );
};

export default TaskModal;
