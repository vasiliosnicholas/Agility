export default function AgilityLogo({className, ...props}: React.SVGProps<SVGSVGElement>) {
  return (
    <svg className={className} viewBox="0 0 18 18"{...props}>
      <rect className="fill-todo" x="1" y="2" width="4" height="14" rx="1.5" />
      <rect
        className="fill-progress"
        x="7"
        y="0"
        width="4"
        height="16"
        rx="1.5"
      />
      <rect
        className="fill-completed"
        x="13"
        y="4"
        width="4"
        height="12"
        rx="1.5"
      />
    </svg>
  );
}
