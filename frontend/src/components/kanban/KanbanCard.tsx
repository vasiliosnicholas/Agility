interface CardProps {
    title: string;
    description?: string;
    isBeingDragged?: boolean;
}

function Card({ title, description = "placeholder", isBeingDragged = false }: CardProps) {
    return (
        <div className="card" style={{ transform: `${isBeingDragged ? "rotate(15deg)" : "rotate(0deg)"}` }}>
            <div className="card-body">
                <h5 className="card-title">{title}</h5>
                <p className="card-description">{description}</p>
            </div>
        </div>
    );
}

export default Card;