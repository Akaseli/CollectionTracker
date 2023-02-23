export interface Field{
  name: string
  type: InputFormat
  sort: number,
  id: number
}

export enum InputFormat{
  TEXT = "text",
  NUMBER = "number",
  DATE = "date"
}