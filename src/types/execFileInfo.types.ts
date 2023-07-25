export interface ExecFileInfo {
    filename: string,
    color: string,
    totalPassed: number,
    totalFailed: number,
    totalTimedOut: number,
    totalSkipped: number,
    totalInterrupted: number,
    totalTests: number,
    totalDuration: number,
    startTime: string,
    endTime: string,
}