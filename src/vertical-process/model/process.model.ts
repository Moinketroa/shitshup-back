import { ProcessTrack } from './process-track.model';

export class Process {
    id: string;
    createdAt: string;
    processTracks: ProcessTrack[];

    hasStep2: true;
    hasStep3: boolean;
    hasStep4: boolean;
    hasStep5: boolean;
    hasStep6: boolean;
    hasStep7: boolean;
}