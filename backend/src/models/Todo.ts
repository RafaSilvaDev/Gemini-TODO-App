import { ObjectId } from "mongodb";

export default class Todo {
  constructor(
    public title: string,
    public description: string,
    public dueDate: Date,
    public status: "pending" | "in-progress" | "completed",
    public userId: ObjectId,
    public _id?: ObjectId
  ) {}
}
