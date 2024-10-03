import { useState, useEffect } from "react";
import TaskModal from "./TaskModal";
import Todo from "../models/Todo";
import api from "../services/api";
import { useNavigate } from "react-router-dom";
import Box from "@mui/material/Box";
import Button from "@mui/material/Button";
import Modal from "@mui/material/Modal";
import TextField from "@mui/material/TextField";
import MenuItem from "@mui/material/MenuItem";
import Select from "@mui/material/Select";
import { FormControl } from "@mui/material";

function TaskList() {
  const [tasks, setTasks] = useState<Todo[]>([]);
  const [openModal, setOpenModal] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Todo | null>(null);
  const [filterTitle, setFilterTitle] = useState("");
  const [filterDueDate, setFilterDueDate] = useState("");
  const [filterStatus, setFilterStatus] = useState("");
  const [showNoTasksFound, setShowNoTasksFound] = useState(false);
  const navigate = useNavigate();

  const loginRoute = () => {
    navigate(`/login`);
  };

  const handleApiError = async (error: any) => {
    if (error.response) {
      if (error.response.status === 401) {
        try {
          const response = await api.post("/refresh", localStorage.getItem("refreshToken"))
          const newAccessToken = response.data.token;
          localStorage.setItem("token", newAccessToken);
          fetchTasks();
        } catch {
          loginRoute();
        }
      } else if (error.response.status === 404) {
        console.error('Not Found:', error.response.data.message);
        setShowNoTasksFound(true);
      } else {
        console.error('Server Error:', error.response.data.message);
      }
    } else if (error.request) {
      console.error('Network Error:', error.message);
    } else {
      console.error('Request Error:', error.message);
    }
  };
  

  const fetchTasks = async () => {
    try {
      const accessToken = localStorage.getItem("token");
      const params: any = {};

      if (filterTitle) {
        params.title = filterTitle;
      }
      if (filterDueDate) {
        params.dueDate = filterDueDate;
      }
      if (filterStatus) {
        params.status = filterStatus;
      }

      const response = await api.get("/todos", {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
        params,
      });

      setTasks(response.data as Todo[]);
      setShowNoTasksFound(response.data.lenght === 0);
    } catch (error: any) {
      handleApiError(error);
    }
  };

  const handleOpenModal = () => {
    setOpenModal(true);
  };

  const handleCloseModal = () => {
    setOpenModal(false);
    setSelectedTask(null);
  };

  const editTask = (task: Todo) => {
    setSelectedTask(task);
    handleOpenModal();
  };

  const createTask = () => {
    setSelectedTask(null);
    handleOpenModal();
  };

  const applyFilters = () => {
    setShowNoTasksFound(false);
    fetchTasks();
  };

  useEffect(() => {
    fetchTasks();
  }, [navigate]);

  const createNewTask = async (newTask: Todo) => {
    try {
      const response = await api.post("/todos", newTask);

      if (response.status === 201) {
        setTasks([...tasks, response.data]);
        handleCloseModal();
        fetchTasks();
      } else {
        console.error("Failed to create task:", response.statusText);
      }
    } catch (error) {
      console.error("Error creating task:", error);
      handleApiError(error)
    }
  };

  const updateTask = async (updatedTask: Todo, taskId: string) => {
    try {
      const accessToken = localStorage.getItem("token");
      const response = await api.put(`/todos/${taskId}`, updatedTask, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      if (response.status === 204) {
        setTasks(tasks.map((t) => (t._id === taskId ? updatedTask : t)));
        handleCloseModal();
        fetchTasks();
      } else {
        console.error("Failed to update task:", response.statusText);
      }
    } catch (error) {
      console.error("Error updating task:", error);
      handleApiError(error)
    }
  };

  const deleteTask = async (taskId: string) => {
    try {
      const accessToken = localStorage.getItem("token");
      const response = await api.delete(`/todos/${taskId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (response.status === 204) {
        setTasks(tasks.filter((t) => t._id !== taskId));
        fetchTasks();
      } else {
        console.error("Failed to delete task:", response.statusText);
      }
    } catch (error) {
      console.error("Error deleting task:", error);
      handleApiError(error)
    }
  };

  const saveNewTask = async (taskData: Todo) => {
    const reqTask: Todo = {
      title: taskData.title,
      description: taskData.description,
      dueDate: taskData.dueDate,
      status: taskData.status,
    };
    if (selectedTask) {
      await updateTask(reqTask, taskData._id!);
    } else {
      await createNewTask(reqTask);
    }
  };

  return (
    <div className="task-list">
      <h2>Task List</h2>
      <FormControl
        sx={{
          m: 1,
          marginBottom: 2,
          display: "flex",
          flexDirection: "row",
          gap: 2,
          flexWrap: "wrap",
        }}
      >
        <TextField
          label="Search by Title"
          value={filterTitle}
          onChange={(e) => setFilterTitle(e.target.value)}
        />
        <TextField
          label="Filter by Due Date"
          type="date"
          value={filterDueDate}
          onChange={(e) => setFilterDueDate(e.target.value)}
          InputLabelProps={{
            shrink: true,
          }}
        />
        <Select
          sx={{ minWidth: 120 }}
          labelId="filter-status-label"
          id="filter-status"
          value={filterStatus}
          onChange={(e) => setFilterStatus(e.target.value)}
        >
          <MenuItem value="" selected>
            All
          </MenuItem>
          <MenuItem value="pending">Pending</MenuItem>
          <MenuItem value="in-progress">In Progress</MenuItem>
          <MenuItem value="completed">Completed</MenuItem>
        </Select>
        <Button variant="contained" onClick={applyFilters}>
          Apply Filters
        </Button>
      </FormControl>

      <div className="tasks-list">
        {showNoTasksFound ? (
          <p>No tasks found matching the selected filters.</p>
        ) : Array.isArray(tasks) && tasks.length > 0 ? (
          tasks.map((task: Todo, index: number) => (
            <div className="task" key={index}>
              <span className="title">{task.title}</span>
              <span className="description">{task.description}</span>
              <span className="due-date">{task.dueDate}</span>
              <span className="status status-{task.status.toLowerCase()}">
                {task.status}
              </span>
              <button onClick={() => editTask(task)}>Edit</button>
            </div>
          ))
        ) : (
          <p>Loading tasks...</p>
        )}
      </div>
      <Button onClick={createTask} variant="contained">
        Create Task
      </Button>

      <Modal
        open={openModal}
        onClose={handleCloseModal}
        className="modal-container"
      >
        <Box>
          <TaskModal
            onClose={handleCloseModal}
            onSave={saveNewTask}
            onDelete={deleteTask}
            task={selectedTask}
          />
        </Box>
      </Modal>
    </div>
  );
}

export default TaskList;
