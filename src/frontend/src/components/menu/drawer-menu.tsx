import Drawer from "antd/lib/drawer"

interface DrawerProps {
  autoFocus?: boolean
  closable?: boolean
  closeIcon?: React.ReactNode
  destroyOnClose?: boolean
  forceRender?: boolean
  maskClosable?: boolean
  mask?: boolean
  maskStyle?: React.CSSProperties
  style?: React.CSSProperties
  drawerStyle?: React.CSSProperties
  headerStyle?: React.CSSProperties
  bodyStyle?: React.CSSProperties
  contentWrapperStyle?: React.CSSProperties
  title?: React.ReactNode
  visible?: boolean
  width?: number | string
  height?: number | string
  zIndex?: number
  prefixCls?: string
  placement?: "top" | "right" | "bottom" | "left"
  onClose?: (e?: any) => void
  afterVisibleChange?: (visible: boolean) => void
  className?: string
  handler?: React.ReactNode
  keyboard?: boolean
  extra?: React.ReactNode
  footer?: React.ReactNode
  footerStyle?: React.CSSProperties
  level?: string | string[] | null | undefined
  children?: React.ReactNode
}

const bodyStyleDefault = { marginTop: "0px" }
const drawerStyleDefault = {}
const contentWrapperStyleDefault = { width: "70%" }
const headerStyleDefault = {
  height: "0px",
  marginBottom: "0px",
  border: 0,
  padding: "0 15px 0 15px",
}

export const BaseDrawer: React.FC<DrawerProps> = ({ ...props }) => {
  return (
    <Drawer
      {...props}
      bodyStyle={props?.bodyStyle ?? bodyStyleDefault}
      drawerStyle={props?.drawerStyle ?? drawerStyleDefault}
      headerStyle={props?.headerStyle ?? headerStyleDefault}
      contentWrapperStyle={props?.contentWrapperStyle ?? contentWrapperStyleDefault}
    />
  )
}
