'use strict';

$(window).load(function() {
    var reg;
    var sub;
    var isSubscribed = false;
    var subscribeButton = document.querySelector('button');
    var IID;

    /**
     *	Debug only!!!
     */
    var AUTH_KEY = "key=AIzaSyDoi7GISX6QvZSywVGB4kYTg7FigAWUoAw";

    function getIID() {
        return reg.pushManager.getSubscription().then(function(pushSubscription) {
            console.log('currentSubscription endpoint:');
            console.log(pushSubscription.endpoint);
            var tmp = pushSubscription.endpoint.split('/');
            IID = tmp[tmp.length - 1];
            return IID;
        });
    }

    function subscribe() {
        reg.pushManager.subscribe({
            userVisibleOnly: true
        }).
        then(function(pushSubscription) {
            sub = pushSubscription;
            console.log(sub);
            console.log('Subscribed! Endpoint:', sub.endpoint);
            var tmp = sub.endpoint.split('/');
            IID = tmp[tmp.length - 1];
            console.log('IID:');
            console.log(IID);
            subscribeButton.textContent = 'Unsubscribe';
            isSubscribed = true;
        });
    }

    function unsubscribe() {
        sub.unsubscribe().then(function(event) {
            subscribeButton.textContent = 'Subscribe';
            console.log('Unsubscribed!', event);
            isSubscribed = false;
            IID = "";
        }).catch(function(error) {
            console.log('Error unsubscribing', error);
            subscribeButton.textContent = 'Subscribe';
        });
    }

    if ('serviceWorker' in navigator) {
        console.log('Service Worker is supported');
        navigator.serviceWorker.register('sw.js').then(function() {
            return navigator.serviceWorker.ready;
        }).then(function(serviceWorkerRegistration) {
            reg = serviceWorkerRegistration;
            subscribeButton.disabled = false;
            console.log('Service Worker is ready :^)', reg);
            getIID();
        }).catch(function(error) {
            console.log('Service Worker Error :^(', error);
        });

        subscribeButton.addEventListener('click', function() {
            if (isSubscribed) {
                unsubscribe();
            } else {
                subscribe();
            }
        });

        var test = {
            ajax1: function() {
                return $.ajax({
                    method: "GET",
                    headers: {
                        Authorization: AUTH_KEY
                    },
                    url: 'https://iid.googleapis.com/iid/info/' + IID,
                    data: {
                        details: true
                    }
                }).then(function(response) {
                    console.log('success');
                    console.log(response);
                }, function(response, status) {
                    console.log('err');
                });
            },
            ajax2: function() {
                return $.ajax({
                    method: "POST",
                    headers: {
                        Authorization: AUTH_KEY
                    },
                    url: 'https://iid.googleapis.com/iid/v1/' + IID + "/rel/topics/global"
                }).then(function(response) {
                    console.log('success 2');
                    console.log(response);
                }, function(response, status) {
                    console.log('err 2');
                });
            },
            ajax3: function() {
                return $.ajax({
                    method: "POST",
                    headers: {
                        "Authorization": AUTH_KEY,
                        "Content-Type": 'application/json'
                    },
                    url: "https://iid.googleapis.com/iid/v1:batchAdd",
                    data: {
                        "to": "/topics/global",
                        "registration_tokens": [IID]
                    }
                }).then(function(response) {
                    console.log('success');
                    console.log(response);
                }, function(response, status) {
                    console.log('err');
                });
            },
            sendPushGCM: function() {
                return $.ajax({
                    method: "POST",
                    dataType: 'json',
                    headers: {
                        "Authorization": AUTH_KEY,
                        "Content-Type": 'application/json'
                    },
                    url: "https://android.googleapis.com/gcm/send",
                    data: JSON.stringify({
                        "to": IID,
                        "data": {
                            'somedata': 1
                        }
                    })
                }).then(function(response) {
                    console.log('success');
                    console.log(response);
                }, function(response, status) {
                    console.log(response);
                    console.log(status);
                    console.log('err');
                });
            },
            sendPushGCM_topic: function() {
                return $.ajax({
                    method: "POST",
                    dataType: 'json',
                    headers: {
                        "Authorization": AUTH_KEY,
                        "Content-Type": 'application/json'
                    },
                    url: "https://android.googleapis.com/gcm/send",
                    data: JSON.stringify({
                        "to": "/topics/global",
                        "data": {
                            "somedata": 2
                        }
                    })
                }).then(function(response) {
                    console.log('success');
                    console.log(response);
                }, function(response, status) {
                    console.log(response);
                    console.log(status);
                    console.log('err');
                });
            }
        };

        $(".ajax").on('click', function(event) {
            test['ajax' + $(this).data('ajaxid')]();
        });
        $(".sw-iid").on('click', function(event) {
            getIID().then(function(data) {
                console.log('current IID:');
                console.log(data);
            });
        });
        $(".push").on('click', function(event) {
            event.preventDefault();
            test.sendPushGCM().then(function(data) {
                console.log('IID push sent');
            });
        });
        $(".pushTopic").on('click', function(event) {
            test.sendPushGCM_topic().then(function(data) {
                console.log('topic push sent');
            });
        });
    }
});