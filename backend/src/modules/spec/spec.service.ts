import { Injectable } from '@nestjs/common';
import { GenAiService } from '../gen-ai/gen-ai.service';

@Injectable()
export class SpecService {
  constructor(private readonly genAiService: GenAiService) {}

  async generateSpec() {
    await this.genAiService.generateSpec(
      'mom-sample.docx',
      [
        {
          title: 'Project Overview',
          description:
            'Summarize the project purpose, background, and business problem being solved. Include why this project is needed and what success looks like.',
          order: 1,
        },
        {
          title: 'Functional Requirements',
          description:
            'List all functional requirements and features discussed in the meeting. Each requirement should describe what the system must do from the user perspective.',
          order: 2,
        },
        {
          title: 'Non-Functional Requirements',
          description:
            'List performance, scalability, security, and technical constraints. Include any platform or device requirements mentioned.',
          order: 3,
        },
        {
          title: 'Stakeholders',
          description:
            'Identify all people, teams, and organizations involved. Include their roles and responsibilities in the project.',
          order: 4,
        },
        {
          title: 'Integrations',
          description:
            'List all external systems, APIs, or third-party services that need to be integrated. Note any unknowns or dependencies.',
          order: 5,
        },
        {
          title: 'Timeline and Milestones',
          description:
            'List any deadlines, milestones, or delivery dates discussed. Note if timeline was not confirmed or requires further discussion.',
          order: 6,
        },
        {
          title: 'Open Items and Risks',
          description:
            'List anything that was left unresolved, requires follow-up, or poses a risk to the project. Include budget if not discussed.',
          order: 7,
        },
        {
          title: 'Legal Requirements',
          description:
            'List any legal requirements or regulations that need to be followed.',
          order: 8,
        },
      ],
      'th',
    );
  }
}
