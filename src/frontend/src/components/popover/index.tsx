import React from "react"
import Popover, { PopoverProps } from "antd/lib/popover"
import "./index.css"
interface Props extends PopoverProps {
  children?: React.ReactNode
}

export const BasePopover: React.FC<Props> = ({ children, ...props }) => (
  <Popover {...props}>{children}</Popover>
)
