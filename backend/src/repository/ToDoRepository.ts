import { ObjectId } from "mongodb";
import { collections } from "../services/database.service";
import Todo from "../models/Todo";

class ToDoRepository {
  async findAll() {
    const todos = await collections.todos!.find({}).toArray();
    return todos;
  }

  async findById(id: string, userId: string) {
    const todo = await collections.todos!.findOne({
      _id: new ObjectId(id),
      userId: new ObjectId(userId),
    });
    return todo;
  }

  async findAllByUserId(userId: string, filter?: any) {
    const todos = await collections
      .todos!.find({ userId: new ObjectId(userId), ...filter })
      .toArray();
    return todos;
  }

  async create(todo: Todo) {
    const result = await collections.todos!.insertOne(todo);
    return result;
  }

  async update(updatedTodo: Partial<Todo>, todoId: string, userId: string) {
    const result = await collections.todos!.updateOne(
      { _id: new ObjectId(todoId), userId: new ObjectId(userId) },
      { $set: updatedTodo }
    );
    return result;
  }

  async delete(todoId: string, userId: string) {
    const result = await collections.todos!.deleteOne({
      _id: new ObjectId(todoId),
      userId: new ObjectId(userId),
    });
    return result;
  }
}

export default new ToDoRepository();
