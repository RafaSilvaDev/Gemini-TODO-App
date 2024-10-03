import TaskList from '../components/TaskList';
import "../pages/stylesheet/TaskList.css";

function HomePage() {
  return (
    <div className="task-list-container">
      <TaskList />
    </div>
  );

}

export default HomePage;