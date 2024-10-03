import express from "express";
import ToDoController from "../controller/ToDoController";
import { authenticateJWT, loginUser, refreshToken, registerUser } from "../auth/auth";

const router = express.Router();

router.get("/todos", authenticateJWT, ToDoController.getTodosByUserId);
router.post("/todos/", authenticateJWT, ToDoController.createTodo);
router.get("/todos/:id", authenticateJWT, ToDoController.getTodoById);
router.put("/todos/:id", authenticateJWT, ToDoController.updateTodoById);
router.delete("/todos/:id", authenticateJWT, ToDoController.deleteTodoById);
router.get("/todos/user/:userId", authenticateJWT, ToDoController.getTodosByUserId);

// Authentication routes
router.post("/register", registerUser);
router.post("/login", loginUser);
router.post("/refresh", refreshToken)

export default router;
