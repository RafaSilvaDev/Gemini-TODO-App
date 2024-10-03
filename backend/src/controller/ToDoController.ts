import { Request, Response } from "express";
import ToDoRepository from "../repository/ToDoRepository";
import Constants from "../utils/constants";
import Todo from "../models/Todo";
import { ObjectId } from "mongodb";

class ToDoController {
  async getAllTodos(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId ?? null;
      if (userId) {
        const result = await ToDoRepository.findAllByUserId(userId);
        if (result.length) res.status(200).json(result);
        else res.status(404).json({ message: Constants.NO_TODOS_FOUND() });
      } else {
        res.status(401).json({ message: Constants.NEED_TO_LOGIN() });
      }
    } catch (e) {
      res.status(500).json({ message: Constants.METHOD_ERROR(), error: e });
    }
  }

  async getTodoById(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId ?? null;
      if (userId) {
        const result = await ToDoRepository.findById(req.params.id, userId);
        if (result) res.status(200).json(result);
        else res.status(404).json({ message: Constants.TODO_NOT_FOUND() });
      } else {
        res.status(401).json({ message: Constants.NEED_TO_LOGIN() });
      }
    } catch (e) {
      res.status(500).json({ message: Constants.METHOD_ERROR(), error: e });
    }
  }

  async getTodosByUserId(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId ?? null;
      if (userId) {
        const { title, status, dueDate } = req.query;
        const filter: any = {};
        if (title) filter.title = title;
        if (status) filter.status = status;
        if (dueDate) filter.dueDate = dueDate;
        const result = await ToDoRepository.findAllByUserId(userId, filter);

        if (result.length) {
          res.status(200).json(result);
        } else {
          res.status(404).json({ message: Constants.NO_TODOS_FOUND() });
        }
      } else {
        res.status(401).json({ message: Constants.NEED_TO_LOGIN() });
      }
    } catch (e) {
      res.status(500).json({ message: Constants.METHOD_ERROR(), error: e });
    }
  }

  async createTodo(req: Request, res: Response) {
    try {
      if (req.body) {
        const userId = req.auth?.userId ?? null;
        if (userId) {
          const newTodo = req.body as Todo;
          newTodo.userId = new ObjectId(userId);
          const result = await ToDoRepository.create(newTodo);
          res.status(201).json({
            message: `Successfully created a new todo with id ${result.insertedId}`,
          });
        } else {
          res.status(401).json({ message: Constants.NEED_TO_LOGIN() });
        }
      } else {
        res.status(404).json({ message: "Todo is required." });
      }
    } catch (e) {
      res.status(500).json({ message: Constants.METHOD_ERROR(), error: e });
    }
  }

  async updateTodoById(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId ?? null;
      if (userId) {
        const todoId = req.params.id;
        const lookUpForTodo = await ToDoRepository.findById(todoId, userId);
        if (lookUpForTodo) {
          const updatedTodo = req.body as Todo;
          await ToDoRepository.update(updatedTodo, todoId, userId);
          res
            .status(204)
            .json({ message: `Successfully updated todo with id ${todoId}` });
        } else {
          res.status(404).json({ message: Constants.TODO_NOT_FOUND() });
        }
      } else {
        res.status(401).json({ message: Constants.NEED_TO_LOGIN() });
      }
    } catch (e) {
      res.status(500).json({ message: Constants.METHOD_ERROR(), error: e });
    }
  }

  async deleteTodoById(req: Request, res: Response) {
    try {
      const userId = req.auth?.userId ?? null;
      if (userId) {
        const todoId = req.params.id;
        const result = await ToDoRepository.delete(todoId, userId);
        if (result && result.deletedCount) {
          res
            .status(204)
            .json({ message: `Successfully removed todo with id ${todoId}` });
        } else if (!result.deletedCount) {
          res
            .status(404)
            .json({ message: `Game with id ${todoId} does not exist` });
        }
      } else {
        res.status(401).json({ message: Constants.NEED_TO_LOGIN() });
      }
    } catch (e) {
      res.status(500).json({ message: Constants.METHOD_ERROR(), error: e });
    }
  }
}

export default new ToDoController();
