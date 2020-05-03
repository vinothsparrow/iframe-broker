var tab_messages = {};
var tab_listeners = {};
var selectedTabId = -1;
var tab_push = {}, tab_lasturl = {};
var ports = {}

const MAX_MESSAGES = 20;

function storeMessage(tabId, message){
    result = tab_messages[tabId]?tab_messages[tabId]:[];

    if(result.length == MAX_MESSAGES){
        result.pop();
    }
    result.push(message);
    tab_messages[tabId] = result;
    if(ports[tabId]){
        ports[tabId].postMessage({'messages':tab_messages[tabId]});
    }
}

function clearMessages(tabId){
    tab_messages[tabId] && delete tab_messages[tabId];
    if(ports[tabId]){
        ports[tabId].postMessage({'messages':[]});
    }
}

function refreshBadgeCount() {
    msgCount = tab_messages[selectedTabId] ? tab_messages[selectedTabId].length : 0;
    listenerCount = tab_listeners[selectedTabId] ? tab_listeners[selectedTabId] : 0;
	chrome.tabs.get(selectedTabId, function() {
		if(msgCount == MAX_MESSAGES){
            chrome.browserAction.setBadgeText({"text": MAX_MESSAGES.toString()+'+', tabId: selectedTabId});
        }
        else {
            chrome.browserAction.setBadgeText({"text": ''+msgCount, tabId: selectedTabId});
        }
        if(listenerCount > 0) {
            chrome.browserAction.setBadgeBackgroundColor({ color: [169,169,169, 255] });
        } else {
            chrome.browserAction.setBadgeBackgroundColor({ color: [255, 0, 0, 255]});
        }
	});
}

chrome.runtime.onMessage.addListener(function(msg, sender, sendResponse) {
	console.log(msg);
	tabId = sender.tab.id;
	if(msg.isMessage) {
        storeMessage(tabId, msg);
	}
    else if(msg.isMessageListener) {
        tab_listeners[tabId]?tab_listeners[tabId]+=tab_listeners[tabId]:tab_listeners[tabId]=1;
    }
    else if(msg.pageReload && msg.isTop) {
        delete tab_lasturl[tabId];
    }
    else if(msg.isPush && msg.isTop) {
        tab_push[tabId] = true;
    }
    else if(msg.isRefresh) {
        // Just refresh count
    }
	refreshBadgeCount();
});

chrome.tabs.onActivated.addListener(function(activeInfo) {
    selectedTabId = activeInfo.tabId;
    chrome.tabs.get(activeInfo.tabId, function(tab){
    });
	refreshBadgeCount();
});

chrome.tabs.onRemoved.addListener(function(tabId, removeInfo) {
    delete tab_listeners[tabId];
    clearMessages(tabId);
});

chrome.tabs.onUpdated.addListener(function(tabId, changeInfo, tab) {
    if (changeInfo.status == "complete") {
		if(tabId == selectedTabId) {
            refreshBadgeCount();
        }
	} else if(changeInfo.status) {
		if(tab_push[tabId]) {
			delete tab_push[tabId];
		} else { 
			if(!tab_lasturl[tabId]) {
				delete tab_listeners[tabId];
                clearMessages(tabId);
			}
		}
	}
	if(changeInfo.status == "loading")
		tab_lasturl[tabId] = true;
});

chrome.tabs.query({active: true, currentWindow: true}, function(tabs) {
    selectedTabId = tabs[0].id;
	refreshBadgeCount();
});

var portConnection = function(devToolsConnection) {
    if(devToolsConnection.name == "popup"){
        // assign the listener function to a variable so we can remove it later
        var popupListener = function(message, sender, sendResponse) {
            if(message.isRefreshMessages){
                msg = tab_messages[selectedTabId]?tab_messages[selectedTabId]:[];
                sender.postMessage({'messages':msg});
            }
        }
        devToolsConnection.onMessage.addListener(popupListener);
        devToolsConnection.onDisconnect.addListener(function(port) {
            devToolsConnection.onMessage.removeListener(popupListener);
        });
        return;
    }
    // assign the listener function to a variable so we can remove it later
    var devToolsListener = function(message, sender, sendResponse) {
        if(message.isRefreshMessages){
            tabId = message.tabId;
            msg = tab_messages[tabId]?tab_messages[tabId]:[];
            sender.postMessage({'messages':msg});
        }
    }
    // add the listener
    devToolsConnection.onMessage.addListener(devToolsListener);

    devToolsConnection.onDisconnect.addListener(function(port) {
        var tabId = parseInt(port.name); 
        if (tabId > 0) {
            delete ports[tabId];
        }
        devToolsConnection.onMessage.removeListener(devToolsListener);
    });
    var tabId = parseInt(devToolsConnection.name);
    if (tabId > 0) {
        ports[tabId] = devToolsConnection;
    }
}

if(chrome.extension.onConnect){
    chrome.extension.onConnect.addListener(portConnection);
}
else {
    chrome.runtime.onConnect.addListener(portConnection);
}