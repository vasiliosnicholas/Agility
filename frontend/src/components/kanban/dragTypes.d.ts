export type DragId = number | string;
export type DropId = number | string;

export type DragType = "card";

export interface DropPayload {
    dragItem: DragId | null;
    dragType: DragType | null;
    drop: DropId | null;
}

export interface DragRenderProps {
    activeItem: DragId | null;
    activeType: DragType | null;
    isDragging: boolean;
}

export type DragItemProps<T extends React.ElementType = "div"> = {
    as?: T;
    dragId: DragId;
    dragType: DragType;
} & React.ComponentPropsWithoutRef<T>;

export type DropZoneProps<T extends React.ElementType = "div"> = {
    as?: T;
    dropType: DragType | null;
    dropId: DropId | null;
    remember?: boolean;
    style?: React.CSSProperties;
    children?: React.ReactNode;
} & React.ComponentPropsWithoutRef<T>;

export interface DropZonesProps extends React.HTMLAttributes<HTMLDivElement> {
    dropType: DragType;
    prevId: DropId | null;
    nextId: DropId | null;
    split?: "y" | "x";
    remember?: boolean;
    children: React.ReactNode;
}

export type DropGuideProps<T extends React.ElementType = "div"> = {
    as?: T;
    dropId: DropId | null;
} & React.ComponentPropsWithoutRef<T>;

export interface DragCtxValue {
    draggable: boolean;
    dragItem: DragId | null;
    dragType: DragType | null;
    isDragging: boolean;
    drop: DropId | null;
    setDrop: (dropId: DropId | null) => void;
    dragStart: (e: React.DragEvent, dragId: DragId, dragType: DragType) => void;
    drag: (e: React.DragEvent) => void;
    dragEnd: () => void;
    onDrop: (e: React.DragEvent) => void;
}