import { ObjectId } from 'mongodb';
import { collections } from '../../services/database.service'; // Adjust path if needed
import ToDoRepository from '../../repository/ToDoRepository'; 
import Todo from '../../models/Todo';

jest.mock('../../services/database.service', () => ({
  collections: {
    todos: {
      find: jest.fn(),
      findOne: jest.fn(),
      insertOne: jest.fn(),
      updateOne: jest.fn(),
      deleteOne: jest.fn(),
    },
  },
}));

describe('ToDoRepository', () => {
  let repository: typeof ToDoRepository;

  beforeEach(() => {
    repository = ToDoRepository; 
    jest.clearAllMocks();
  });

  it('should find all todos', async () => {
    const mockTodos = [{ _id: new ObjectId(), title: 'Test 1' }, { _id: new ObjectId(), title: 'Test 2' }];
    (collections.todos!.find as jest.Mock).mockReturnValueOnce({ toArray: async () => mockTodos });

    const todos = await repository.findAll();

    expect(collections.todos!.find).toHaveBeenCalledWith({});
    expect(todos).toEqual(mockTodos);
  });

  it('should find a todo by ID and userId', async () => {
    const mockTodo = { _id: new ObjectId(), userId: new ObjectId(), title: 'Test Todo' };
    (collections.todos!.findOne as jest.Mock).mockReturnValueOnce(mockTodo);

    const todoId = mockTodo._id.toString();
    const userId = mockTodo.userId.toString();
    const todo = await repository.findById(todoId, userId);

    expect(collections.todos!.findOne).toHaveBeenCalledWith({ 
      _id: new ObjectId(todoId), 
      userId: new ObjectId(userId) 
    });
    expect(todo).toEqual(mockTodo);
  });

  it('should find all todos by userId', async () => {
    const userId = new ObjectId();
    const mockTodos = [{ _id: new ObjectId(), userId, title: 'Test 1' }, { _id: new ObjectId(), userId, title: 'Test 2' }];
    (collections.todos!.find as jest.Mock).mockReturnValueOnce({ toArray: async () => mockTodos });

    const todos = await repository.findAllByUserId(userId.toString());

    expect(collections.todos!.find).toHaveBeenCalledWith({ userId });
    expect(todos).toEqual(mockTodos);
  });

  it('should create a new todo', async () => {
    const newTodo: Todo = {
      _id: new ObjectId(),
      userId: new ObjectId(),
      title: 'New Todo',
      description: 'Description',
      dueDate: new Date(),
      status: 'pending',
    };
    const mockResult = { insertedId: newTodo._id };
    (collections.todos!.insertOne as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await repository.create(newTodo);

    expect(collections.todos!.insertOne).toHaveBeenCalledWith(newTodo);
    expect(result).toEqual(mockResult);
  });

  it('should update a todo', async () => {
    const todoId = new ObjectId();
    const userId = new ObjectId();
    const updatedTodo: Partial<Todo> = { title: 'Updated Title', status: 'completed' };
    const mockResult = { modifiedCount: 1 }; 
    (collections.todos!.updateOne as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await repository.update(updatedTodo, todoId.toString(), userId.toString());

    expect(collections.todos!.updateOne).toHaveBeenCalledWith(
      { _id: todoId, userId },
      { $set: updatedTodo }
    );
    expect(result).toEqual(mockResult); 
  });

  it('should delete a todo', async () => {
    const todoId = new ObjectId();
    const userId = new ObjectId();
    const mockResult = { deletedCount: 1 };
    (collections.todos!.deleteOne as jest.Mock).mockResolvedValueOnce(mockResult);

    const result = await repository.delete(todoId.toString(), userId.toString());

    expect(collections.todos!.deleteOne).toHaveBeenCalledWith({ 
      _id: todoId, 
      userId 
    });
    expect(result).toEqual(mockResult);
  });
});
