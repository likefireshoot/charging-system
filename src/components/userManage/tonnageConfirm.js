import { createVNode, render, h } from "vue";

// 修改基数（改吨数）命令下发前的二次确认框。
// 以 Promise 方式使用：确认勾选并点击“确认下发”后 resolve，取消则 reject。
const ConfirmComponent = {
  name: "TonnageConfirmBox",
  props: {
    onResolve: { type: Function, default: () => {} },
    onReject: { type: Function, default: () => {} },
  },
  data() {
    return { checked: false };
  },
  render() {
    const checkboxStyle = {
      display: "flex",
      alignItems: "flex-start",
      gap: "8px",
      marginTop: "18px",
      fontSize: "16px",
      color: "#303133",
      cursor: "pointer",
      lineHeight: "1.6",
    };
    const btnBase = {
      height: "40px",
      padding: "0 22px",
      borderRadius: "6px",
      fontSize: "16px",
      cursor: "pointer",
      border: "none",
    };
    return h(
      "div",
      {
        style: {
          position: "fixed",
          top: "0",
          right: "0",
          bottom: "0",
          left: "0",
          zIndex: "10000",
          background: "rgba(31, 33, 38, 0.55)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
        },
      },
      [
        h(
          "div",
          {
            style: {
              width: "560px",
              maxWidth: "90vw",
              maxHeight: "90vh",
              overflow: "auto",
              background: "#fff",
              borderRadius: "10px",
              boxShadow: "0 12px 40px rgba(0, 0, 0, 0.2)",
            },
          },
          [
            h(
              "div",
              {
                style: {
                  padding: "18px 24px",
                  fontSize: "20px",
                  fontWeight: "700",
                  color: "#303133",
                  borderBottom: "1px solid #f0f0f0",
                },
              },
              "修改基数确认"
            ),
            h("div", { style: { padding: "24px" } }, [
              h(
                "div",
                {
                  style: {
                    background: "#fff7e6",
                    border: "1px solid #ffe0a3",
                    borderLeft: "4px solid #faad14",
                    borderRadius: "8px",
                    padding: "14px 16px",
                    color: "#8c6d1f",
                    fontSize: "16px",
                    lineHeight: "1.8",
                  },
                },
                [
                  h("p", { style: { margin: "0" } },
                    [
                      "修改基数命令执行成功后，系统将自动把水表吨数同步为本次填写的新基数，并自该基数起",
                      h("b", "重新计费"),
                      "。",
                    ]),
                  h("p", { style: { margin: "8px 0 0" } },
                    [
                      "若修改区间内已产生的水量需要计费，请前往「用户管理 - 余额调整」对用户进行",
                      h("b", "手动扣费"),
                      "。",
                    ]),
                ]
              ),
              h(
                "label",
                { style: checkboxStyle },
                [
                  h("input", {
                    type: "checkbox",
                    checked: this.checked,
                    onChange: (e) => (this.checked = e.target.checked),
                    style: { marginTop: "3px", width: "18px", height: "18px", cursor: "pointer" },
                  }),
                  h("span", "我已知晓：修改基数成功后，将从新的基数开始计费。"),
                ]
              ),
            ]),
            h(
              "div",
              { style: { display: "flex", justifyContent: "flex-end", gap: "12px", padding: "0 24px 20px" } },
              [
                h(
                  "button",
                  {
                    style: {
                      ...btnBase,
                      background: this.checked ? "#46b97e" : "#b7dcc9",
                      color: "#fff",
                      cursor: this.checked ? "pointer" : "not-allowed",
                    },
                    disabled: !this.checked,
                    onClick: () => this.checked && this.onResolve(),
                  },
                  "确认下发"
                ),
                h(
                  "button",
                  {
                    style: {
                      ...btnBase,
                      background: "#fff",
                      border: "1px solid #dcdfe6",
                      color: "#606266",
                    },
                    onClick: () => this.onReject(),
                  },
                  "取消"
                ),
              ]
            ),
          ]
        ),
      ]
    );
  },
};

export function confirmTonnageChange() {
  return new Promise((resolve, reject) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const cleanup = () => {
      render(null, container);
      container.remove();
    };
    const vnode = createVNode(ConfirmComponent, {
      onResolve: () => {
        cleanup();
        resolve();
      },
      onReject: () => {
        cleanup();
        reject();
      },
    });
    render(vnode, container);
  });
}
