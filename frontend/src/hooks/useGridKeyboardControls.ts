import { useEffect, useRef, useState } from "react";

interface RowProps<RowElement extends HTMLElement>
  extends
    Pick<
      React.DetailedHTMLProps<React.HTMLAttributes<RowElement>, RowElement>,
      "ref"
    >,
    Required<
      Pick<
        React.DetailedHTMLProps<React.HTMLAttributes<RowElement>, RowElement>,
        "tabIndex" | "role" | "onKeyDown"
      >
    > {
  role: "row";
}

interface ColumnProps<ColElement extends HTMLElement>
  extends
    Omit<RowProps<ColElement>, "role" | "onKeyDown">,
    Required<
      Pick<
        React.DetailedHTMLProps<React.HTMLAttributes<ColElement>, ColElement>,
        "onBlur" | "onKeyDownCapture"
      >
    > {
  role: "rowgroup";
}

export type ColElementRefObject<ColElement extends HTMLElement> =
  React.RefObject<ColElement | null> | undefined;

interface ColumnRefSetter<ColElement extends HTMLElement> {
  setColumnRef?: (colRef: ColElementRefObject<ColElement>) => void;
}

export interface AdjacentColumnRefObjectProps<
  ColElement extends HTMLElement,
> extends ColumnRefSetter<ColElement> {
  leftColumnRef?: ColElementRefObject<ColElement>;
  rightColumnRef?: ColElementRefObject<ColElement>;
}

// Source - https://stackoverflow.com/a/69413070
// Posted by John H. Kohler, modified by community. See post 'Timeline' for change history
// Retrieved 2026-08-09, License - CC BY-SA 4.0
type NonNegativeInteger<T extends number> = `${T}` extends
  `-${string}` | `${string}.${string}`
  ? never
  : T;

type RowHandler<RowElement extends HTMLElement, T extends number> = (
  rowIndex: NonNegativeInteger<T>
) => RowProps<RowElement>;

export default function useGridKeyboardControls<
  RowElement extends HTMLElement,
  ColElement extends HTMLElement,
>({
  leftColumnRef = undefined,
  rightColumnRef = undefined,
  setColumnRef = undefined,
}: AdjacentColumnRefObjectProps<ColElement> = {}): [
  RowHandler<RowElement, number>,
  ColumnProps<ColElement>,
] {
  const [controlCol, setControlCol] = useState(true);
  const colRef = useRef<ColElement>(null);

  useEffect(() => {
    if (setColumnRef && colRef) {
      setColumnRef(colRef);
    }
  }, [colRef, setColumnRef]);

  const rowRefs = useRef<(RowElement | null)[]>([]);

  const useHandleRow: RowHandler<RowElement, number> = (rowIndex) => {
    if (rowIndex < 0 || !Number.isInteger(rowIndex))
      throw new RangeError("rowIndex must be a non-negative integer");
    // if (rowIndex > rowRefs.current.length) {
    //   throw new RangeError(`rowIndex of ${rowIndex} must be < ${rowRefs.current.length}`)
    // }
    return {
      ref: ((element) =>
        rowIndex < rowRefs.current.length
          ? (rowRefs.current[rowIndex] = element)
          : rowRefs.current.push(element)) as (
        element: RowElement | null
      ) => void,
      role: "row",
      tabIndex: controlCol ? -1 : 0,
      onKeyDown: ({ key }) => {
        switch (key) {
          case "ArrowUp":
            if (rowIndex > 0) rowRefs.current[rowIndex - 1]?.focus();
            break;
          case "ArrowDown":
            if (rowIndex < rowRefs.current.length - 1)
              rowRefs.current[rowIndex + 1]?.focus();
            break;
        }
      },
    };
  };

  return [
    useHandleRow,
    {
      ref: colRef,
      role: "rowgroup",
      tabIndex: controlCol ? 0 : -1,
      onBlur: (event) => {
        if (!event.currentTarget?.contains(event.relatedTarget))
          setControlCol(true);
      },
      onKeyDownCapture: (event) => {
        switch (event.key) {
          case "Enter":
            if (controlCol) {
              setControlCol(false);
              rowRefs.current[0]?.focus();
            }
            break;
          case "Escape":
            setControlCol(true);
            colRef.current?.focus();
            break;
          case "ArrowUp":
            event.preventDefault();
            setControlCol(false);
            rowRefs.current[0]?.focus();
            break;
          case "ArrowDown":
            event.preventDefault();
            setControlCol(false);
            rowRefs.current[0]?.focus();
            break;
          case "ArrowLeft":
            if (leftColumnRef) {
              event.preventDefault();
              setControlCol(true);
              leftColumnRef.current?.focus();
            }
            break;
          case "ArrowRight":
            if (rightColumnRef) {
              event.preventDefault();
              setControlCol(true);
              rightColumnRef.current?.focus();
            }
            break;
        }
      },
    },
  ];
}
