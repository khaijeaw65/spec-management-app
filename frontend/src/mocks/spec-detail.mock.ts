import type { SpecificationDetail } from "@/types/spec-detail.types";
import type { SpecificationListItem } from "@/types/spec.types";

import { MOCK_SPECIFICATIONS } from "@/mocks/spec.mock";

const ECOM_DETAIL: SpecificationDetail = {
  id: "spec-ecom-platform",
  title: "E-Commerce Platform Requirements",
  description:
    "Complete specification for building a modern e-commerce platform.",
  templateLabel: "Standard Template",
  status: "REVIEWED",
  language: "en",
  version: 2,
  createdByName: "John Doe",
  createdAt: "2024-03-10T10:00:00.000Z",
  updatedAt: "2024-03-15T12:00:00.000Z",
  momPlainText: `E-Commerce Platform — MOM excerpt (demo)

Attendees: PM, Tech Lead, BA
Goals: Define MVP storefront scope and non-functional expectations.

Discussion highlights:
- Users should be able to reset passwords without contacting support.
- Admin can manage user permissions and approve refunds when needed.
- Payment gateway will be integrated before the public launch milestone.
- Performance targets discussed: high concurrency and sub-2s page loads for key paths.`,
  sections: [
    {
      sortOrder: 1,
      title: "Overview",
      body:
        "This specification defines a modern e-commerce platform that enables seamless shopping experiences, including product catalog browsing, cart management, secure checkout, and order fulfillment. The system must support high traffic, mobile-first usage, and integration with payment and shipping providers.",
    },
    {
      sortOrder: 2,
      title: "User Requirements",
      body:
        "Users must be able to create accounts, browse and search products, add items to a cart, and complete checkout with multiple payment methods. Guest checkout should be supported where policy allows. Order history and profile management must be available from the account area.",
    },
    {
      sortOrder: 3,
      title: "Admin Features",
      body:
        "Administrators manage product listings, inventory levels, pricing, promotions, and customer orders. The admin console should provide sales analytics, low-stock alerts, and role-based access so that staff permissions can be restricted by responsibility.",
    },
    {
      sortOrder: 4,
      title: "Performance Requirements",
      body:
        "The storefront must sustain at least 10,000 concurrent users under peak load. Page load times for primary shopping paths should remain under two seconds on a typical broadband connection, with graceful degradation when third-party services are slow.",
    },
    {
      sortOrder: 5,
      title: "Security",
      body:
        "All sensitive data in transit must use TLS. Cardholder data handling must align with PCI DSS requirements. Passwords must be stored using a strong adaptive hashing algorithm. Administrative actions should be audited with timestamps and user identity.",
    },
  ],
  risks: [
    {
      id: "risk-1",
      priority: "high",
      categoryLabel: "Ambiguous word",
      relatedSectionName: "User Requirements",
      summary:
        "The word 'should' is ambiguous — unclear if it's mandatory or optional.",
      contextQuote:
        "Users 'should' be able to reset their password without contacting support.",
    },
    {
      id: "risk-2",
      priority: "high",
      categoryLabel: "Unclear scope",
      relatedSectionName: "Admin Features",
      summary:
        "Scope is unclear — no specific mention of which user roles are involved.",
      contextQuote:
        "Admin can manage user permissions and approve refunds when needed.",
    },
    {
      id: "risk-3",
      priority: "medium",
      categoryLabel: "Missing timeline",
      relatedSectionName: "Performance Requirements",
      summary: "No timeline specified for implementation.",
      contextQuote:
        "Payment gateway will be integrated before the public launch milestone.",
    },
  ],
  versions: [
    {
      version: 2,
      isCurrent: true,
      updatedAt: "2024-03-15T12:00:00.000Z",
      summary: "Updated performance requirements and security guidelines.",
    },
    {
      version: 1,
      isCurrent: false,
      updatedAt: "2024-03-10T10:00:00.000Z",
      summary: "Initial version created from MOM.",
    },
  ],
};

function buildPlaceholderDetail(item: SpecificationListItem): SpecificationDetail {
  return {
    id: item.id,
    title: item.title,
    description: `Specification generated from template “${item.templateLabel}”.`,
    templateLabel: item.templateLabel,
    status: item.status,
    language: item.language,
    version: item.version,
    createdByName: "Demo User",
    createdAt: item.updatedAt,
    updatedAt: item.updatedAt,
    momPlainText: "",
    sections: [
      {
        sortOrder: 1,
        title: "Summary",
        body:
          "This version is a placeholder detail view. Connect the API to load GeneratedSpecSection content from the backend.",
      },
    ],
    risks: [],
    versions: [
      {
        version: item.version,
        isCurrent: true,
        updatedAt: item.updatedAt,
        summary: "Latest generated version.",
      },
    ],
  };
}

export function getSpecificationDetail(id: string): SpecificationDetail | null {
  const listItem = MOCK_SPECIFICATIONS.find((s) => s.id === id);
  if (!listItem) return null;
  if (id === "spec-ecom-platform") return ECOM_DETAIL;
  return buildPlaceholderDetail(listItem);
}
