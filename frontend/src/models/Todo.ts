export default class Todo {
  constructor(
    public title: string,
    public description: string,
    public dueDate: string,
    public status: string,
    public userId?: string,
    public _id?: string
  ) {}
}
