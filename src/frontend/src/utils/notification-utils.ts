import { BaseNotiData } from "@components/notification"
import notification from "antd/es/notification"

export const utilsNotification = {
  success: (description: string) => {
    notification.open({
      message: BaseNotiData.success.title,
      description: BaseNotiData.success.description(description),
      className: BaseNotiData.success.className,
      icon: BaseNotiData.success.icon,
    })
  },
  warning: (description: string) => {
    notification.open({
      message: BaseNotiData.warning.title,
      description: BaseNotiData.success.description(description),
      className: BaseNotiData.warning.className,
      icon: BaseNotiData.warning.icon,
    })
  },
  error: (description: string) => {
    notification.open({
      message: BaseNotiData.error.title,
      description: BaseNotiData.success.description(description),
      className: BaseNotiData.error.className,
      icon: BaseNotiData.error.icon,
    })
  },
}
