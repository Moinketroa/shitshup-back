import { MusicDataAnalysisResult } from './music-data-analysis-result.model';

export class Step7Result {
    notionRowId: string;
    musicDataAnalysisResult: MusicDataAnalysisResult;
    dropboxFilePath: string;
    sharingLink?: string;
}