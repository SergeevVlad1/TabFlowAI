import type { InputProps } from "./input.type";
import style from "./input.module.scss";

export const Input = ({ type, placeholder, value, onChange, cn }: InputProps) => {
  return (
    <input
      type={type}
      placeholder={placeholder}
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      className={style[`input__${cn}`]}
    />
  );
};
