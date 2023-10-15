import { NotionDatabaseColumn } from './notion-database-column.enum';
import { MusicDataCategory } from '../../../essentia/model/music-data-category.enum';
import { MusicDataGenre } from '../../../essentia/model/music-data-genre.enum';
import { MusicDataKey } from '../../../essentia/model/music-data-key.enum';
import { MusicDataKeyCamelot } from '../../../essentia/model/music-data-key-camelot.enum';
import { MusicDataKeyOpen } from '../../../essentia/model/music-data-key-open.enum';

export const notionDatabaseSchema = {
    [NotionDatabaseColumn.ID]: getTitleProperty(),
    [NotionDatabaseColumn.NAME]: getRichTextProperty(),
    [NotionDatabaseColumn.ARTIST]: getRichTextProperty(),
    [NotionDatabaseColumn.LENGTH]: getRichTextProperty(),
    [NotionDatabaseColumn.FILENAME]: getRichTextProperty(),
    [NotionDatabaseColumn.FILEPATH]: getRichTextProperty(),
    [NotionDatabaseColumn.REPLAY_GAIN]: getNumberWithCommaProperty(),
    [NotionDatabaseColumn.SAMPLE_RATE]: getNumberProperty(),
    [NotionDatabaseColumn.BPM]: getNumberWithCommaProperty(),
    [NotionDatabaseColumn.ALT_BPM]: getNumberWithCommaProperty(),
    [NotionDatabaseColumn.DANCEABILITY]: getNumberWithCommaProperty(),
    [NotionDatabaseColumn.KEY]: getSelectProperty(Object.values(MusicDataKey)),
    [NotionDatabaseColumn.KEY_OPEN_NOTATION]: getSelectProperty(Object.values(MusicDataKeyOpen)),
    [NotionDatabaseColumn.KEY_CAMELOT]: getSelectProperty(Object.values(MusicDataKeyCamelot)),
    [NotionDatabaseColumn.GENRES]: getMultiSelectProperty(Object.values(MusicDataGenre)),
    [NotionDatabaseColumn.ALT_GENRES]: getMultiSelectProperty(Object.values(MusicDataGenre)),
    [NotionDatabaseColumn.TIMBRE]: getNumberWithCommaProperty(),
    [NotionDatabaseColumn.CATEGORIES]: getMultiSelectProperty(Object.values(MusicDataCategory)),
};

function getTitleProperty(): any {
    return {
        title: {},
        type: 'title' as 'title',
    };
}

function getRichTextProperty(): any {
    return {
        rich_text: {},
        type: 'rich_text' as 'rich_text',
    }
}

function getNumberProperty(): any {
    return {
        number: {
            format: 'number' as 'number',
        },
        type: 'number' as 'number',
    };
}

function getNumberWithCommaProperty(): any {
    return {
        number: {
            format: 'number_with_commas' as 'number_with_commas',
        },
        type: 'number' as 'number',
    };
}

function getSelectProperty(selectOptions: string[]): any {
    return {
        select: {
            options: selectOptions.map(selectOption => createSelectOption(selectOption)),
        },
        type: 'select' as 'select',
    }
}

function getMultiSelectProperty(selectOptions: string[]): any {
    return {
        multi_select: {
            options: selectOptions.map(selectOption => createSelectOption(selectOption)),
        },
        type: 'multi_select' as 'multi_select',
    }
}

function createSelectOption(name: string): any {
    return {
        id: name,
        name: name,
    }
}