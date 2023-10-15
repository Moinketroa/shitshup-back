import { WarningEntity } from '../../dao/warning/entity/warning.entity';
import { Warning } from '../model/warning.model';
import { UserEntity } from '../../dao/user/entity/user.entity';
import { WarningType } from './warning-type.enum';

export class WarningMapper {

    fromEntity(warningEntity: WarningEntity): Warning {
        return <Warning>{
            videoId: warningEntity.videoId,
            warningType: warningEntity.warningType,
            warningMessage: warningEntity.warningMessage,
        };
    }

    buildEntity(
        videoId: string,
        warningType: WarningType,
        warningMessage: string,
        userEntity: UserEntity,
    ): WarningEntity {
        return <WarningEntity>{
            videoId: videoId,
            warningType: warningType,
            warningMessage: warningMessage,
            user: userEntity,
        };
    }

}