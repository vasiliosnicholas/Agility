import Login from "./Login";
import Register from "./Register";

import type { FormWindowComponentProps } from "../FormComponents.d.ts";
import FormWindow from "../FormWindow.tsx";

const AuthWindow = ({
  Forms: Modes = [Login, Register],
}: Partial<FormWindowComponentProps>) => {
  return <FormWindow Forms={Modes} />;
};

export default AuthWindow;
