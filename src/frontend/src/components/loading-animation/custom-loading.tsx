import "./custom-loading.css"

export function CustomLoading() {
  return (
    <div className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
      <div className="loader-root" />
    </div>
  )
}
