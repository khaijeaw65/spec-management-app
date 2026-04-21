export const createTemplateExample = {
  name: 'Retail Order Management Template',
  description:
    'Standard sections for capturing functional and non-functional requirements from MOM workshops with stakeholders.',
  language: 'EN',
  sections: [
    {
      title: 'Business objectives',
      description: 'Goals, KPIs, and success criteria the product must achieve.',
      order: 0,
    },
    {
      title: 'Scope and exclusions',
      description:
        'In-scope capabilities and items explicitly out of scope for this release.',
      order: 1,
    },
    {
      title: 'Integration points',
      description: 'ERP, payment providers, shipping carriers, and third-party APIs.',
      order: 2,
    },
  ],
} as const;

export const updateTemplateExample = {
  id: '550e8400-e29b-41d4-a716-446655440000',
  versionId: '550e8400-e29b-41d4-a716-446655440003',
  name: 'Retail Order Management Template',
  description:
    'Updated after stakeholder review: clarified inventory sync and return-handling flows.',
  language: 'TH',
  sections: [
    {
      title: 'วัตถุประสงค์ทางธุรกิจ',
      description: 'เป้าหมาย ตัวชี้วัดความสำเร็จ และเกณฑ์ความสำเร็จที่ตกลงในการประชุม',
      order: 0,
    },
    {
      title: 'ขอบเขตและข้อยกเว้น',
      description:
        'ความสามารถที่อยู่ในขอบเขตและรายการที่ตัดออกจากเวอร์ชันนี้อย่างชัดเจน',
      order: 1,
    },
  ],
} as const;
