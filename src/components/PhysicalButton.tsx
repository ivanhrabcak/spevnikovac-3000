import { ButtonHTMLAttributes } from "react"
import './css/physical-button.css'

type Props = {
    text: string
} & ButtonHTMLAttributes<HTMLButtonElement>;

export const PhysicalButton = ({text, className, ...props}: Props) => (
    <button 
        className={className != undefined ? "pushable " + className : "pushable"}
        {...props}
    >
        <span className="shadow"></span>
        <span className="edge"></span>
        <span className="front">
            {text}
        </span>
    </button>
)
