import { ExecBrowserInfo } from "./execBrowserInfo.types";
import { ExecFileInfo } from "./execFileInfo.types";

export interface ExecInfo {
    browserName: string,
    totalPassed: number,
    totalFailed: number,
    totalTimedOut: number,
    totalSkipped: number,
    totalInterrupted: number,
    totalTests: number,
    startTime: string,
    endTime: string,
    execFiles: ExecFileInfo[],
    execBrowsers: ExecBrowserInfo[],
}