import type { JSX } from "react";

interface TemplateProps {
  children: JSX.Element | Array<JSX.Element>;
}
export default function Template({ children }: TemplateProps) {
  return <>{children}</>; //Add common site elements here
}
