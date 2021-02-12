window.addEventListener('iframeTracker', function(event) {
	chrome.runtime.sendMessage(event.detail);
});

var s = document.createElement('script');
s.src = chrome.extension.getURL('script.js');
(document.head||document.documentElement).appendChild(s);