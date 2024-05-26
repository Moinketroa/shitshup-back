import { Injectable } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import * as FormData from 'form-data';
import * as fs from 'fs';
import * as path from 'path';
import * as process from 'process';
import { catchError, map, Observable, tap, throwError } from 'rxjs';
import { AxiosRequestConfig } from 'axios';
import { MusicDataEntity } from './entity/music-data.entity';

@Injectable()
export class EssentiaHttpRepository {

    private readonly SHITSHUP_ESSENTIA_API_URL: string;
    private readonly musicDataPath: string = 'musicData';
    private readonly spleeterDataPath: string = 'spleeter';

    constructor(private readonly http: HttpService) {
        this.SHITSHUP_ESSENTIA_API_URL = process.env.SHITSHUP_ESSENTIA_API_URL ?? '';
    }

    fetchMusicData(filePath: string, userId: string): Observable<MusicDataEntity> {
        try {
            const url = `${ this.SHITSHUP_ESSENTIA_API_URL }/${ this.musicDataPath }/${ userId }`;

            const formData: FormData = this.createFormDataFromFilePath(filePath);

            const response = this.http.post<MusicDataEntity>(
                url,
                formData,
                this.getOptionsFromFormData(formData),
            );

            return response.pipe(
                map(axiosResponse => axiosResponse.data),
            );
        } catch (error) {
            throw error;
        }
    }

    fetchSpleeterData(filePath: string, userId: string, outputLocationPath: string): Observable<void> {
        const writer = fs.createWriteStream(outputLocationPath);
        const url = `${ this.SHITSHUP_ESSENTIA_API_URL }/${ this.spleeterDataPath }/${ userId }`;

        try {
            const formData: FormData = this.createFormDataFromFilePath(filePath);

            const response = this.http.post(
                url,
                formData,
                this.getSpleeterOptions(formData)
            );

            return response.pipe(
                map(axiosResponse => axiosResponse.data),
                tap(data => {
                    return new Promise((resolve, reject) => {
                        data.pipe(writer);
                        let error: Error | null = null;
                        writer.on('error', err => {
                            error = err;
                            writer.close();
                            fs.unlinkSync(outputLocationPath);
                            reject(err);
                        });
                        writer.on('close', () => {
                            if (!error) {
                                resolve(true);
                            }
                        });
                    }).then();
                }),
                catchError((error: any) => {
                    if (!writer.closed) {
                        writer.end();
                    }
                    fs.unlinkSync(outputLocationPath);
                    return throwError(error);
                }),
            );
        } catch (error) {
            throw error;
        }
    }

    private createFormDataFromFilePath(filePath: string): FormData {
        const form = new FormData();
        form.append('file', fs.createReadStream(filePath), {
            filename: path.parse(filePath).base,
        });

        return form;
    }

    private getOptionsFromFormData(formData: FormData): AxiosRequestConfig {
        return {
            headers: {
                ...formData.getHeaders(),
            },
        };
    }

    private getSpleeterOptions(formData: FormData): AxiosRequestConfig {
        const options = this.getOptionsFromFormData(formData);
        return {
            ...options,
            responseType: 'stream',
        }
    }
}