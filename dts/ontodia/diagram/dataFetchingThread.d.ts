export declare class DataFetchingThread {
    private fetchingPromise;
    private fetchingQueue;
    private waitingTime;
    constructor(waitingTime?: number);
    startFetchingThread(typeId: string): Promise<string[]>;
}
