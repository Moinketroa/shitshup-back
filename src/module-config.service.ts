import { Injectable } from '@nestjs/common';
import * as dotenv from 'dotenv';
import * as fs from 'fs';

@Injectable()
export class ModuleConfigService {
    private readonly envConfig: any;

    constructor() {
        this.envConfig = dotenv.parse(fs.readFileSync(`.env`));
    }

    get config(): any {
        return this.envConfig;
    }
}
