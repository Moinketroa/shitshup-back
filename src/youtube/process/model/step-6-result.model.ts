import { MusicDataAnalysisResult } from './music-data-analysis-result.model';

export class Step6Result {
    notionRowId: string;
    musicDataAnalysisResult: MusicDataAnalysisResult;
    dropboxFilePath: string;
    sharingLink?: string;
}