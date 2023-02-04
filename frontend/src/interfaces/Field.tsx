export interface Field{
  name: string
  type: InputFormat
}

export enum InputFormat{
  STRING = "string",
  NUMBER = "number",
  DATE = "date"
}