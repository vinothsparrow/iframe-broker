function populateTable(messages){
    var table = document.getElementById("messages");
    var empty = document.getElementById("empty");
    if(messages.length > 0){
        while(table.rows.length > 1) {
            table.deleteRow(1);
        }
        empty.innerHTML = '';
        var i;
        for (i = 0; i < messages.length; i++) {
            msg = messages[i];
            var row = table.insertRow();
            var from = row.insertCell(0);
            var to = row.insertCell(1);
            var message = row.insertCell(2);
            from.setAttribute('data-th', 'From');
            from.innerText = msg.origin;
            to.setAttribute('data-th', 'To');
            to.innerText = msg.to;
            message.setAttribute('data-th', 'Message');
            message.innerText = msg.data;
        }
    }
    else {
        while(table.rows.length > 0) {
            table.deleteRow(0);
        }
        empty.innerHTML = '<section class="page_404"> <div class="container"> <div class="row"> <div class="col-sm-12 "> <div class="col-sm-10 col-sm-offset-1  text-center"> <div class="four_zero_four_bg"> <h1 class="text-center ">Nope</h1> </div> <div class="contant_box_404"> <h3 class="h2"> No messages </h3> <p>Looks like there are no cross window/frame messages.</p> </div> </div> </div> </div> </div> </section>';
    }
}

var backgroundPageConnection = chrome.runtime.connect({
    name: chrome.devtools.inspectedWindow.tabId.toString()
});

function refreshMessages(){
    backgroundPageConnection.postMessage({
        tabId: chrome.devtools.inspectedWindow.tabId,
        isRefreshMessages: true
    });
}

backgroundPageConnection.onMessage.addListener(function (message) {
    if(message.messages){
        populateTable(message.messages);
    }
});

backgroundPageConnection.onDisconnect.addListener(function () {
    console.log('Disconnected from tab ' + chrome.devtools.inspectedWindow.tabId + '.');
});

window.addEventListener('load', (event) => {
    refreshMessages();
});  

document.addEventListener('contextmenu', event => event.preventDefault());