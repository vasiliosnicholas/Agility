import Login from "./Login";
import Register from "./Register";

import type { FormWindowComponentProps } from "../FormComponents.d.ts";
import FormWindow from "../FormWindow.tsx";

const AuthWindow = ({ Modes = [Login, Register] }: Partial<FormWindowComponentProps>) => {
  return <FormWindow Modes={Modes}/>
};

export default AuthWindow;
