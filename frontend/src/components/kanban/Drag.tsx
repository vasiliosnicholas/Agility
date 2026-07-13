import React from "react";
import type * as DragTypes from "./dragTypes.d.ts";

const DragContext = React.createContext<DragTypes.DragCtxValue | null>(null);

interface DragProps {
    draggable?: boolean;
    handleDrop?: (payload: DragTypes.DropPayload) => void;
    children: React.ReactNode | ((renderProps: DragTypes.DragRenderProps) => React.ReactNode);
};

function Drag({ draggable = true, handleDrop, children }: DragProps) {
    const [dragItem, setDragItem] = React.useState<DragTypes.DragId | null>(null);
    const [dragType, setDragType] = React.useState<DragTypes.DragType | null>(null);
    const [isDragging, setIsDragging] = React.useState(false);
    const [drop, setDrop] = React.useState<DragTypes.DropId | null>(null);

    React.useEffect(() => {
        if (dragItem) {
            document.body.style.cursor = "grabbing";
        } else {
            document.body.style.cursor = "default";
        }

    }, [dragItem]);

    const dragStart = function (e: React.DragEvent<Element>, dragId: DragTypes.DragId, dragType: DragTypes.DragType) {
        e.stopPropagation();
        e.dataTransfer.effectAllowed = "move";
        setDragItem(dragId);
        if (dragType) {
            setDragType(dragType);
        }
    };

    const drag = function (e: React.DragEvent<Element>) {
        e.stopPropagation();
        setIsDragging(true);
    };

    const dragEnd = function () {
        setDragItem(null);
        setDragType(null);
        setIsDragging(false);
        setDrop(null);
    };

    const onDrop = function (e: React.DragEvent<Element>) {
        e.stopPropagation();
        handleDrop?.({ dragItem, dragType, drop });
        setDragItem(null);
        setDragType(null);
        setIsDragging(false);
        setDrop(null);
    };

    return (
        <DragContext.Provider value={{ draggable, dragItem, dragType, isDragging, drop, setDrop, dragStart, drag, dragEnd, onDrop }}>
            {typeof children === "function" ? children({ activeItem: dragItem, activeType: dragType, isDragging }) : children}
        </DragContext.Provider>
    );
};

function DragItem<T extends React.ElementType = "div">({ as, dragId, dragType, ...props }: DragTypes.DragItemProps<T>) {
    const { draggable, dragStart, drag, dragEnd } = React.useContext(DragContext) as DragTypes.DragCtxValue;
    const Component: React.ElementType = as || "div";
    return <Component onDragStart={(e: React.DragEvent<Element>) => dragStart(e, dragId, dragType)}
        draggable={draggable}
        onDrag={drag}
        onDragEnd={dragEnd}
        {...props}
    />;
};

function DropZone({ as, dropId, dropType, remember, style, children, ...props }: DragTypes.DropZoneProps) {
    const { dragItem, dragType, setDrop, drop, onDrop } = React.useContext(DragContext) as DragTypes.DragCtxValue;

    function handleDragOver(e: React.DragEvent<Element>) {
        if (e.preventDefault) {
            e.preventDefault();
        }

        return false;
    };

    function handleDragLeave(e: React.DragEvent<Element>) {
        e.stopPropagation();
        if (!remember) {
            setDrop(null);
        }
    };

    const Component: React.ElementType = as || "div";

    return (
        <Component onDragEnter={(e) => { e.stopPropagation(); if (dragItem && dropType === dragType) { setDrop(dropId); } }}
            onDragOver={handleDragOver}
            onDrop={onDrop}
            style={{ position: "relative", ...style }}
            {...props}>
            {children}
            {drop === dropId && <div style={{ position: "absolute", inset: "0px" }} onDragLeave={handleDragLeave} />}
        </Component>
    )
};

function DropZones({ dropType, prevId, nextId, split = "y", remember, children, ...props }: DragTypes.DropZonesProps) {
    const { dragType, isDragging } = React.useContext(DragContext) as DragTypes.DragCtxValue;

    return (
        <div style={{ position: "relative" }} {...props}>
            {children}
            {dragType === dropType && isDragging &&
                <div style={{ position: "absolute", inset: "0px", display: "flex", flexDirection: split === "x" ? "row" : "column" }}>
                    <DropZone dropId={prevId} style={{ width: "100%", height: "100%" }} dropType={dropType} remember={remember} />
                    <DropZone dropId={nextId} style={{ width: "100%", height: "100%" }} dropType={dropType} remember={remember} />
                </div>
            }
        </div>
    )

};

function DropGuide({ as, dropId, ...props }: DragTypes.DropGuideProps) {
    const { drop } = React.useContext(DragContext) as DragTypes.DragCtxValue;
    const Component: React.ElementType = as || "div";
    return drop === dropId ? <Component {...props} /> : null;
};

type DragComponent = typeof Drag & {
    DragItem: typeof DragItem;
    DropZone: typeof DropZone;
    DropZones: typeof DropZones;
    DropGuide: typeof DropGuide;
};

const DragWithSubcomponents = Drag as DragComponent;
DragWithSubcomponents.DragItem = DragItem;
DragWithSubcomponents.DropZone = DropZone;
DragWithSubcomponents.DropZones = DropZones;
DragWithSubcomponents.DropGuide = DropGuide;

export default DragWithSubcomponents;