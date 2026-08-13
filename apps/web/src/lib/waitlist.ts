/** 触发等待列表弹层 —— 通过自定义事件解耦，任意 client 按钮都可调用 */
export function openWaitlist() {
  if (typeof window !== "undefined") {
    window.dispatchEvent(new CustomEvent("yo:waitlist"));
  }
}
