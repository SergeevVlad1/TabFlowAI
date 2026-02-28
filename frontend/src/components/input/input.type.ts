export const InputType = {
  text: "text",
  number: "number",
  email: "email",
  password: "password",
} as const;

export type InputType = (typeof InputType)[keyof typeof InputType];

export interface InputProps {
  type: InputType;
  placeholder?: string;
  value?: string;
  cn?: string;
  onChange: (value: string) => void;
}
