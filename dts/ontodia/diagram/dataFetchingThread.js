"use strict";
var DEFAULT_WAITING_TIME = 200;
var DataFetchingThread = (function () {
    function DataFetchingThread(waitingTime) {
        this.fetchingPromise = null;
        this.fetchingQueue = [];
        this.waitingTime = waitingTime || DEFAULT_WAITING_TIME;
    }
    DataFetchingThread.prototype.startFetchingThread = function (typeId) {
        var _this = this;
        this.fetchingQueue.push(typeId);
        if (this.fetchingPromise) {
            return Promise.resolve([]);
        }
        else {
            this.fetchingPromise = new Promise(function (resolve) {
                setTimeout(function () {
                    _this.fetchingPromise = null;
                    var queue = _this.fetchingQueue;
                    _this.fetchingQueue = [];
                    resolve(queue);
                }, 200);
            });
            return this.fetchingPromise;
        }
    };
    return DataFetchingThread;
}());
exports.DataFetchingThread = DataFetchingThread;
