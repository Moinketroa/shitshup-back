export enum TaskCategory {
    PROCESSING_MAIN = 'PROCESSING',

    STEP1 = 'STEP 1',

    SUB1_LIST_ALL_IDS = 'LIST ALL IDS TO PROCESS',
    SUB1_CHECK_EXPLICIT_DUPLICATES = 'CHECK EXPLICIT DUPLICATES',
    SUB1_DELETE_EXPLICIT_DUPLICATES = 'DELETE EXPLICIT DUPLICATES',

    STEP2 = 'STEP 2',

    SUB2_DOWNLOAD_PLAYLIST = 'DOWNLOAD PLAYLIST',
    SUB2_PARSE_FILE_INFOS = 'PARSE VIDEO INFOS',
    SUB2_DELETE_FILE_INFO_TEMP_FILE = 'DELETE FILE INFO TEMP FILE',
    SUB2_GET_IDS_NOT_DOWNLOADED = 'GET VIDEOS NOT DOWNLOADED',

    STEP3 = 'STEP 3',

    SUB3_DELETE_IDS_FROM_PENDING = 'DELETING VIDEOS FROM PENDING PLAYLIST',

    STEP4 = 'STEP 4',

    SUB4_ANALYSE_SIMPLE_MUSIC_DATAS = 'ANALYSING SIMPLE MUSIC DATAS',

    STEP5 = 'STEP 5',

    SUB5_PUSH_RESULTS_TO_NOTION = 'PUSH RESULTS TO NOTION',

    STEP6 = 'STEP 6',

    SUB6_GET_SPLEETER_DATA = 'PREDICT STEMS FROM SPLEETER',

    STEP7 = 'STEP 7',

    SUB7_UPLOAD_TRACKS_TO_DROPBOX = 'UPLOAD TRACKS TO DROPBOX',
}
