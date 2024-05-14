export class ErrorsLogger {
  private static instance: ErrorsLogger | undefined;
  private errorLogs: string[] = [];

  private constructor() {}

  static getInstance(): ErrorsLogger {
    if (!ErrorsLogger.instance) {
      ErrorsLogger.instance = new ErrorsLogger();
    }
    return ErrorsLogger.instance;
  }

  public startCollectingErrors() {
    const logs = this.errorLogs;
    const oldError = console.error;
    console.error = function (...args: any[]) {
      logs.push(...args);
      oldError.apply(console, args);
    };
  }

  public getErrors() {
    return this.errorLogs;
  }
}
