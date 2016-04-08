'use strict';

$(window).load(function() {
    var reg;
    var sub;
    var isSubscribed = false;
    var subscribeButton = document.querySelector('button');
    var IID;

    /**
     *	Server-side information, debug only!!!
     */
    var AUTH_KEY = "key=AIzaSyDoi7GISX6QvZSywVGB4kYTg7FigAWUoAw";
    var GROUPD_NOTIFY_ID = "APA91bFVVubIbiSysbcGqgIUy1my7GZYE3xVvdBOBIQtzFf2WiFLpGaAfweXeR6Ee5r1ySp4kzoSAB4sM00rbYO3p2RgqaH8wjT5u19mzahARVuUPslzljw";
    var NUMERIC_PROJECT_ID = 42931818645;

    function getIID() {
        return reg.pushManager.getSubscription().then(function(pushSubscription) {
            if (pushSubscription && pushSubscription.endpoint) {
                IID = pushSubscription.endpoint.split('/').slice(-1)[0];
                return IID;
            } else {
                return false;
            }
        }, function(response, status) {
            return false;
        });
    }

    function getIID2() {
        return reg.pushManager.getSubscription().then(function(pushSubscription) {
            if (pushSubscription && pushSubscription.endpoint) {
                IID = pushSubscription.endpoint.split('/').slice(-1)[0];
                return IID;
            } else {
                return false;
            }
        }, function(response, status) {
            return false;
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
            IID = sub.endpoint.split('/').slice(-1)[0];
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
            ajaxSubscribeToGroup: function() {
                return $.ajax({
                    method: "POST",
                    crossDomain: true,
                    dataType: 'json',
                    headers: {
                        "Authorization": AUTH_KEY,
                        "Content-Type": 'application/json',
                        "project_id": NUMERIC_PROJECT_ID
                    },
                    url: "https://android.googleapis.com/gcm/notification",
                    data: JSON.stringify({
                        "operation": "add",
                        "notification_key_name": "notifyKeyName",
                        "notification_key": GROUPD_NOTIFY_ID,
                        "registration_ids": [IID]
                    })
                }).then(function(response) {
                    console.log('success');
                    console.log(response);
                }, function(response, status) {
                    console.log('err');
                    console.log(response);
                    console.log(status);
                });
            },
            ajaxUnsubscribeFromGroup: function() {
                return $.ajax({
                    method: "POST",
                    crossDomain: true,
                    headers: {
                        "Authorization": AUTH_KEY,
                        "Content-Type": 'application/json',
                        "project_id": NUMERIC_PROJECT_ID,
                        "Access-Control-Allow-Origin": "*"
                    },
                    url: "https://android.googleapis.com/gcm/notification",
                    data: JSON.stringify({
                        "operation": "remove",
                        "notification_key_name": "notifyKeyName",
                        "notification_key": GROUPD_NOTIFY_ID,
                        "registration_ids": [IID]
                    })
                }).then(function(response) {
                    console.log('success');
                    console.log(response);
                }, function(response, status) {
                    console.log('err');
                    console.log(response);
                    console.log(status);
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
            },
            sendPushGroup: function() {
                return $.ajax({
                    method: "POST",
                    dataType: 'json',
                    headers: {
                        "Authorization": AUTH_KEY,
                        "Content-Type": 'application/json'
                    },
                    url: "https://android.googleapis.com/gcm/send",
                    data: JSON.stringify({
                        "to": GROUPD_NOTIFY_ID,
                        "data": {
                            "somedata": 3
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
        $(".addToGroup").on('click', function(event) {
            test.ajaxSubscribeToGroup();
        });
        $(".removeFromGroup").on('click', function(event) {
            test.ajaxUnsubscribeFromGroup();
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
        $(".pushGroup").on('click', function(event) {
            test.sendPushGroup().then(function(data) {
                console.log('topic push sent');
            });
        });

    }
});