try {
  console.log("Edit 'pages/devtools/src/index.ts' and save to reload.");
  chrome.devtools.panels.create('Dev Tools', 'logo.png', 'devtools-panel/index.html');
} catch (e) {
  console.error(e);
}
