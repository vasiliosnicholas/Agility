import { useRef, useState } from "react";

interface RowProps<RowElement extends HTMLElement> extends Pick<
    React.DetailedHTMLProps<React.HTMLAttributes<RowElement>, RowElement>,
    "ref"
  >, Required<
  Pick<
    React.DetailedHTMLProps<React.HTMLAttributes<RowElement>, RowElement>,
    "tabIndex" | "role"
  >
> {
  role: "row";
}

interface ColumnProps<ColElement extends HTMLElement>
  extends
    Omit<RowProps<ColElement>, "role">,
    Required<
      Pick<
        React.DetailedHTMLProps<React.HTMLAttributes<ColElement>, ColElement>,
        "onBlur" | "onKeyDownCapture"
      >
    > {
  role: "rowgroup";
}

// Source - https://stackoverflow.com/a/69413070
// Posted by John H. Kohler, modified by community. See post 'Timeline' for change history
// Retrieved 2026-08-09, License - CC BY-SA 4.0
type NonNegativeInteger<T extends number> = `${T}` extends `-${string}` | `${string}.${string}` ? never : T;

type RowHandler<RowElement extends HTMLElement, T extends number> = (rowIndex: NonNegativeInteger<T>) => RowProps<RowElement>;    

export default function useGridKeyboardControls<RowElement extends HTMLElement, ColElement extends HTMLElement>(): [RowHandler<RowElement, number>, ColumnProps<ColElement>] {
  const [controlCol, setControlCol] = useState(true);
  const colRef = useRef<ColElement>(null);
  const firstRowRef = useRef<RowElement>(null);

  const handleRow: RowHandler<RowElement, number>  = (
    rowIndex: NonNegativeInteger<number>
  ) => {
    if (rowIndex < 0 || !Number.isInteger(rowIndex))
      throw new RangeError("rowIndex must be a non-negative integer");
    return {
      ref: rowIndex === 0 ? firstRowRef : undefined,
      role: "row",
      tabIndex: controlCol ? -1 : 0,
    };
  }

  return [
    handleRow,
    {
      ref: colRef,
      role: "rowgroup",
      tabIndex: controlCol ? 0 : -1,
      onBlur: (event) => {
        if (!event.currentTarget?.contains(event.relatedTarget))
          setControlCol(true);
      },
      onKeyDownCapture: ({ key }) => {
        switch (key) {
          case "Enter":
            if (controlCol) {
              setControlCol(false);
              firstRowRef.current?.focus();
            }
            break;
          case "Escape":
            setControlCol(true);
            colRef.current?.focus();
            break;
        }
      },
    },
  ];
}
