import { FC } from "react";
import CurrencyInput from "react-currency-input-field";

interface ICurrentInput {
  setAmount: any;
}

export const CurrentInput: FC<ICurrentInput> = ({ setAmount }) => {
  return (
    <CurrencyInput
      onValueChange={(value) => setAmount(value)}
      id="validation-example-2-field"
      placeholder="$1,234,567"
      allowDecimals={true}
      className={`form-control`}
      prefix={"$"}
      step={10}
      width={140}
    />
  );
};

export default CurrentInput;
