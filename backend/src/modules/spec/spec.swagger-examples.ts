export const generateSpecMultipartExample = {
  name: 'E-Commerce Platform Requirements',
  momContent:
    'The steering committee approved OAuth2 with refresh-token rotation, PostgreSQL as the system of record, and a phased rollout beginning Q2. Outstanding: exact RTO/RPO targets and whether nightly CSV exports from the legacy warehouse remain mandatory. Next steps: BA to validate inventory sync assumptions with ERP by end of week.',
  inputType: 'TEXT',
  mainTemplateId: '550e8400-e29b-41d4-a716-446655440001',
  versionId: '550e8400-e29b-41d4-a716-446655440002',
} as const;

/** Output language is taken from the main template; only MOM + input type are sent. */
export const regenerateSpecMultipartExample = {
  momContent: generateSpecMultipartExample.momContent,
  inputType: 'TEXT',
} as const;
