const { contextBridge, ipcRenderer } = require("electron");

window.addEventListener('DOMContentLoaded', () => {
  const replaceText = (selector, text) => {
    const element = document.getElementById(selector)
    if (element) element.innerText = text
  }

  for (const dependency of ['chrome', 'node', 'electron']) {
    replaceText(`${dependency}-version`, process.versions[dependency])
  }
})

contextBridge.exposeInMainWorld("api", {
  send: (channel, args) => {
    if (["toMain"].includes(channel)) {
      ipcRenderer.send(channel, args);
    }
  },
  receive: (channel, callback) => {
    if (["fromMain"].includes(channel)) {
      ipcRenderer.on(channel, (event, args) => {
        callback(args);
      });
    }
  }
});
