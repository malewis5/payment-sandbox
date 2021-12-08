import * as React from "react";
import { postNonce } from "./Payments/PayPal/PayPalUtils";

interface ISubmitButton {
  payload?: any;
}

const SubmitButton: React.FC<ISubmitButton> = ({ payload = "" }) => {
  const nonceBoolean = payload.nonce?.length ? false : true;
  return (
    <div style={{ width: "100%" }}>
      <button
        disabled={nonceBoolean}
        style={{ width: "100%" }}
        onClick={() => postNonce(payload)}
      >
        {!nonceBoolean ? "Submit Payment" : "No Nonce"}
      </button>
    </div>
  );
};

export default SubmitButton;
