import { Injectable } from '@nestjs/common';
import { NotionDatabaseColumn } from '../schema/notion-database-column.enum';
import { MusicDataAnalysisResult } from '../../../youtube/process/model/music-data-analysis-result.model';

@Injectable()
export class NotionPropertiesMapper {

    toNotionProperties(analysisResult: MusicDataAnalysisResult, databaseProperties: any): any {
        return {
            [NotionDatabaseColumn.ID]: this.convertToTitle(analysisResult.videoId),
            [NotionDatabaseColumn.NAME]: this.convertToRichText(analysisResult.trackName),
            [NotionDatabaseColumn.ARTIST]: this.convertToRichText(analysisResult.artist),
            [NotionDatabaseColumn.FILEPATH]: this.convertToRichText(analysisResult.filePath),
            [NotionDatabaseColumn.FILENAME]: this.convertToRichText(analysisResult.fileName),

            [NotionDatabaseColumn.LENGTH]: this.convertToRichText(analysisResult.length),
            [NotionDatabaseColumn.SAMPLE_RATE]: this.convertToNumber(analysisResult.sampleRate),

            [NotionDatabaseColumn.REPLAY_GAIN]: this.convertToNumber(analysisResult.replayGain),
            [NotionDatabaseColumn.BPM]: this.convertToNumber(analysisResult.bpm),
            [NotionDatabaseColumn.ALT_BPM]: this.convertToNumber(analysisResult.altBpm),
            [NotionDatabaseColumn.DANCEABILITY]: this.convertToNumber(analysisResult.danceability),

            [NotionDatabaseColumn.KEY]: this.convertToSelect(
                analysisResult.key,
                databaseProperties,
                NotionDatabaseColumn.KEY,
            ),
            [NotionDatabaseColumn.KEY_OPEN_NOTATION]: this.convertToSelect(
                analysisResult.keyOpenNotation,
                databaseProperties,
                NotionDatabaseColumn.KEY_OPEN_NOTATION,
            ),
            [NotionDatabaseColumn.KEY_CAMELOT]: this.convertToSelect(
                analysisResult.keyCamelot,
                databaseProperties,
                NotionDatabaseColumn.KEY_CAMELOT,
            ),

            [NotionDatabaseColumn.GENRES]: this.convertToMultiSelect(
                analysisResult.genres,
                databaseProperties,
                NotionDatabaseColumn.GENRES,
            ),
            [NotionDatabaseColumn.ALT_GENRES]: this.convertToMultiSelect(
                analysisResult.altGenres,
                databaseProperties,
                NotionDatabaseColumn.ALT_GENRES,
            ),
            [NotionDatabaseColumn.TIMBRE]: this.convertToNumber(analysisResult.timbre),
            [NotionDatabaseColumn.CATEGORIES]: this.convertToMultiSelect(
                analysisResult.categories,
                databaseProperties,
                NotionDatabaseColumn.CATEGORIES,
            ),
        }
    }

    private convertToSelect(option: string, databaseProperties: any, propertyToSearch: string) {
        return {
            select: this.findCorrespondingSelectOption(option, databaseProperties, propertyToSearch, 'select')
        }
    }

    private convertToMultiSelect(options: string[], databaseProperties: any, propertyToSearch: string) {
        return {
            multi_select: options.map(option => this.findCorrespondingSelectOption(option, databaseProperties, propertyToSearch, 'multi_select'))
        }
    }

    private findCorrespondingSelectOption(nameToFound: string, databaseProperties: any, propertyToSearch: string, propertySubPath: string): any {
        const selectOptions: any[] = databaseProperties[propertyToSearch][propertySubPath].options;

        return selectOptions.find(selectOption => selectOption.name === nameToFound);
    }

    private convertToNumber(value: number): any {
        return {
            number: value,
        };
    }

    private convertToTitle(oneLinerText: string): any {
        return {
            title: this.convertText(oneLinerText),
        };
    }

    private convertToRichText(oneLinerText: string): any {
        return {
            rich_text: this.convertText(oneLinerText)
        }
    }

    private convertText(oneLinerText: string): any {
        return [{
            text: {
                content: oneLinerText,
            },
        }];
    }

}