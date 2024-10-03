import { Request, Response } from "express";
import { ObjectId } from "mongodb";
import ToDoController from "../../controller/ToDoController";
import ToDoRepository from "../../repository/ToDoRepository";
import Constants from "../../utils/constants";

jest.mock("../../repository/ToDoRepository");

const mockRequest = {
  auth: {
    userId: new ObjectId().toString(),
  },
  params: {
    id: new ObjectId().toString(),
  },
  body: {
    title: "Updated Title",
    description: "Updated Description",
    dueDate: new Date(),
    status: "in-progress",
  },
} as unknown as Request;

const mockRequestWithoutUserId = {
  params: {
    id: new ObjectId().toString(),
  },
  body: {
    title: "Updated Title",
    description: "Updated Description",
    dueDate: new Date(),
    status: "in-progress",
  },
} as unknown as Request;

const mockRequestWithoutBody = {
  auth: {
    userId: new ObjectId().toString(),
  },
  params: {
    id: new ObjectId().toString(),
  },
} as unknown as Request;

const mockResponse = {
  status: jest.fn().mockReturnThis(),
  json: jest.fn(),
} as unknown as Response;

describe("ToDoController", () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it("getAllTodos: should return 200 and todos when found", async () => {
    const mockTodos = [{ _id: new ObjectId(), title: "Test 1" }];
    (ToDoRepository.findAllByUserId as jest.Mock).mockResolvedValueOnce(
      mockTodos
    );

    await ToDoController.getAllTodos(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockTodos);
  });

  it("getAllTodos: should return 404 when no todos found", async () => {
    (ToDoRepository.findAllByUserId as jest.Mock).mockResolvedValueOnce([]);

    await ToDoController.getAllTodos(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NO_TODOS_FOUND(),
    });
  });

  it("getAllTodos: should return 400 when userId is missing", async () => {
    await ToDoController.getAllTodos(mockRequestWithoutUserId, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NEED_TO_LOGIN(),
    });
  });

  it("getAllTodos: should handle errors gracefully", async () => {
    (ToDoRepository.findAllByUserId as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await ToDoController.getAllTodos(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.METHOD_ERROR(),
      error: new Error("Database error"),
    });
  });

  it("getTodoById: should return 200 and the todo when found", async () => {
    const mockTodo = { _id: new ObjectId(), title: "Test Todo" };
    (ToDoRepository.findById as jest.Mock).mockResolvedValueOnce(mockTodo);

    await ToDoController.getTodoById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockTodo);
  });

  it("getTodoById: should return 404 when todo not found", async () => {
    (ToDoRepository.findById as jest.Mock).mockResolvedValueOnce(null);

    await ToDoController.getTodoById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.TODO_NOT_FOUND(),
    });
  });

  it("getTodoById: should return 400 when userId is missing", async () => {
    await ToDoController.getTodoById(mockRequestWithoutUserId, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NEED_TO_LOGIN(),
    });
  });

  it("getTodoById: should handle errors gracefully", async () => {
    (ToDoRepository.findById as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await ToDoController.getTodoById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.METHOD_ERROR(),
      error: new Error("Database error"),
    });
  });

  it("getTodosByUserId: should return 200 and todos when found", async () => {
    const mockTodos = [{ _id: new ObjectId(), title: "Test 1" }];
    (ToDoRepository.findAllByUserId as jest.Mock).mockResolvedValueOnce(
      mockTodos
    );

    await ToDoController.getTodosByUserId(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(200);
    expect(mockResponse.json).toHaveBeenCalledWith(mockTodos);
  });

  it("getTodosByUserId: should return 404 when no todos found", async () => {
    (ToDoRepository.findAllByUserId as jest.Mock).mockResolvedValueOnce([]);

    await ToDoController.getTodosByUserId(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NO_TODOS_FOUND(),
    });
  });

  it("getTodosByUserId: should return 400 when userId is missing", async () => {
    await ToDoController.getTodosByUserId(
      mockRequestWithoutUserId,
      mockResponse
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NEED_TO_LOGIN(),
    });
  });

  it("getTodosByUserId: should handle errors gracefully", async () => {
    (ToDoRepository.findAllByUserId as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await ToDoController.getTodosByUserId(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.METHOD_ERROR(),
      error: new Error("Database error"),
    });
  });

  it("createTodo: should return 201 and create the todo when request body is valid", async () => {
    const mockResult = { insertedId: new ObjectId() };
    (ToDoRepository.create as jest.Mock).mockResolvedValueOnce(mockResult);

    await ToDoController.createTodo(mockRequest, mockResponse);

    expect(ToDoRepository.create).toHaveBeenCalledWith({
      ...mockRequest.body,
      userId: new ObjectId(mockRequest.auth!.userId),
    });
    expect(mockResponse.status).toHaveBeenCalledWith(201);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `Successfully created a new todo with id ${mockResult.insertedId}`,
    });
  });

  it("createTodo: should return 404 when request body is missing", async () => {
    await ToDoController.createTodo(mockRequestWithoutBody, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: "Todo is required.",
    });
  });

  it("createTodo: should return 400 when userId is missing", async () => {
    await ToDoController.createTodo(mockRequestWithoutUserId, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NEED_TO_LOGIN(),
    });
  });

  it("createTodo: should handle errors gracefully", async () => {
    (ToDoRepository.create as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await ToDoController.createTodo(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.METHOD_ERROR(),
      error: new Error("Database error"),
    });
  });

  it("updateTodoById: should return 204 and update the todo when found", async () => {
    const mockTodo = {
      _id: new ObjectId(mockRequest.params.id),
      userId: new ObjectId(mockRequest.auth!.userId),
      title: "Original Title",
    };
    (ToDoRepository.findById as jest.Mock).mockResolvedValueOnce(mockTodo);
    (ToDoRepository.update as jest.Mock).mockResolvedValueOnce({
      modifiedCount: 1,
    });

    await ToDoController.updateTodoById(mockRequest, mockResponse);

    expect(ToDoRepository.findById).toHaveBeenCalledWith(
      mockRequest.params.id,
      mockRequest.auth!.userId
    );
    expect(ToDoRepository.update).toHaveBeenCalledWith(
      mockRequest.body,
      mockRequest.params.id,
      mockRequest.auth!.userId
    );
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `Successfully updated todo with id ${mockRequest.params.id}`,
    });
  });

  it("updateTodoById: should return 404 when todo not found", async () => {
    (ToDoRepository.findById as jest.Mock).mockResolvedValueOnce(null);

    await ToDoController.updateTodoById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.TODO_NOT_FOUND(),
    });
  });

  it("updateTodoById: should return 400 when userId is missing", async () => {
    await ToDoController.updateTodoById(
      mockRequestWithoutUserId,
      mockResponse
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NEED_TO_LOGIN(),
    });
  });

  it("updateTodoById: should handle errors gracefully", async () => {
    (ToDoRepository.findById as jest.Mock).mockResolvedValueOnce({
      _id: new ObjectId(mockRequest.params.id),
      userId: new ObjectId(mockRequest.auth!.userId),
      title: "Original Title",
    });
    (ToDoRepository.update as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await ToDoController.updateTodoById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.METHOD_ERROR(),
      error: new Error("Database error"),
    });
  });

  it("deleteTodoById: should return 204 and delete the todo when found", async () => {
    const mockResult = { deletedCount: 1 };
    (ToDoRepository.delete as jest.Mock).mockResolvedValueOnce(mockResult);

    await ToDoController.deleteTodoById(mockRequest, mockResponse);

    expect(ToDoRepository.delete).toHaveBeenCalledWith(
      mockRequest.params.id,
      mockRequest.auth!.userId
    );
    expect(mockResponse.status).toHaveBeenCalledWith(204);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `Successfully removed todo with id ${mockRequest.params.id}`,
    });
  });

  it("deleteTodoById: should return 404 when todo not found", async () => {
    const mockResult = { deletedCount: 0 };
    (ToDoRepository.delete as jest.Mock).mockResolvedValueOnce(mockResult);

    await ToDoController.deleteTodoById(mockRequest, mockResponse);

    expect(ToDoRepository.delete).toHaveBeenCalledWith(
      mockRequest.params.id,
      mockRequest.auth!.userId
    );
    expect(mockResponse.status).toHaveBeenCalledWith(404);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: `Game with id ${mockRequest.params.id} does not exist`,
    });
  });

  it("deleteTodoById: should return 400 when userId is missing", async () => {
    await ToDoController.deleteTodoById(
      mockRequestWithoutUserId,
      mockResponse
    );

    expect(mockResponse.status).toHaveBeenCalledWith(400);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.NEED_TO_LOGIN(),
    });
  });

  it("deleteTodoById: should handle errors gracefully", async () => {
    (ToDoRepository.delete as jest.Mock).mockRejectedValueOnce(
      new Error("Database error")
    );

    await ToDoController.deleteTodoById(mockRequest, mockResponse);

    expect(mockResponse.status).toHaveBeenCalledWith(500);
    expect(mockResponse.json).toHaveBeenCalledWith({
      message: Constants.METHOD_ERROR(),
      error: new Error("Database error"),
    });
  });
});

