import { files, sharing, users } from 'dropbox';

export type DropboxAccount = users.FullAccount;

export type DropboxFileMetadata = files.FileMetadata;

export type DropboxLinkMetadataReference = sharing.FileLinkMetadataReference | sharing.FolderLinkMetadataReference | sharing.SharedLinkMetadataReference
