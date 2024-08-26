import { HtmlHTMLAttributes, ImgHTMLAttributes } from "react"

type Props = {
    src: string
} & ImgHTMLAttributes<HTMLImageElement>

export const Icon = ({src, className, ...props}: Props) => (
    <img 
        src={src} 
        className={className != undefined ? 'logo ' + className : 'logo'}
        {...props} 
    />
)