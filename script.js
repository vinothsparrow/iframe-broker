(function() {
    'use strict';

    function isTop(){
        return window === window.parent;
    }

    function pushEvent(msg){
        var trackEvent = new CustomEvent('iframeTracker', {'detail':msg});
        window.dispatchEvent(trackEvent);
    }

    window.addEventListener('message', function(e) {
        pushEvent({isTop: isTop(), isMessage:true, origin: e.origin, to: window.location.href, data: (typeof e.data == 'string'? e.data:'[object] '+JSON.stringify(e.data))});
        // console.log('%c[iframe-broker] %c' + e.origin + ' => ' + window.location.href + ' %c' + (typeof e.data == 'string'? e.data:'[object] '+JSON.stringify(e.data)), 'color:red','',"color: green");
    });

    window.addEventListener('load', (event) => {
        pushEvent({isRefresh:true, isTop: isTop()});
    });

    window.addEventListener('beforeunload', function(event) {
        pushEvent({pageReload:true, isTop: isTop()});
    });

    var oldListener = Window.prototype.addEventListener;

    Window.prototype.addEventListener = function(type, listener, useCapture) {
        if(type === 'message') {
            pushEvent({isMessageListener:true, isTop: isTop()});
        }
        return oldListener.apply(this, arguments);
    };

    var oldPushState = History.prototype.pushState;

    History.prototype.pushState = function(state, title, url) {
		pushEvent({isPush:true, isTop: isTop()});
		return oldPushState.apply(this, arguments);
	};
})();