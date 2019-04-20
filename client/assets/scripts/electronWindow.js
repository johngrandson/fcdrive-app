(() => {
    const { BrowserWindow } = require('electron').remote;

    // Minimize task
    document.getElementById("minimize").addEventListener("click", (e) => {
        let window = BrowserWindow.getFocusedWindow();
        e.preventDefault();
        window.minimize();
    });

    // Close app
    document.getElementById("close").addEventListener("click", (e) => {
        let window = BrowserWindow.getFocusedWindow();
        window.close();
    });

})()