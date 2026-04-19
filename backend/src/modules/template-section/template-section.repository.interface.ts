import { TemplateSectionEntity } from 'src/entities/template-section.entity';
import { DeepPartial } from 'typeorm';

export abstract class ITemplateSectionRepository {
  abstract createMany(
    sections: DeepPartial<TemplateSectionEntity>[],
  ): Promise<TemplateSectionEntity[]>;
}
